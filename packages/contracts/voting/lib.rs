#![cfg_attr(not(feature = "std"), no_std)]
#![allow(clippy::new_without_default)]

/// Evaluate `$x:expr` and if not true return `Err($y:expr)`.
///
/// Used as `ensure!(expression_to_ensure, expression_to_return_on_false)`
#[macro_export]
macro_rules! ensure {
    ( $x:expr, $y:expr $(,)?) => {{
        if !$x {
            return Err($y.into());
        }
    }};
}

#[ink::contract]
mod voting {
    use ink::env::debug_print;
    use ink::prelude::{string::String, vec::Vec};
    use ink::storage::Mapping;

    // ProposalId & UserId
    pub type ProposalId = i32;
    pub type UserId = i32;

    // Proposal struct
    #[derive(Debug, scale::Decode, scale::Encode, Eq, PartialEq, Clone, Default)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct Proposal {
        proposal_name: String,
        vote_aye: i32,
        vote_nye: i32,
        total_vote: i32,
        proposal_status: bool,
        voting_finished: bool,
        id: ProposalId,
    }

    // User struct
    #[derive(Debug, scale::Decode, scale::Encode, Eq, PartialEq, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct User {
        user_name: String,
        user_account: AccountId,
        voted_proposal: Vec<Proposal>,
    }

    // User Default implementaion
    impl Default for User {
        fn default() -> Self {
            Self {
                user_name: String::new(),
                user_account: [0u8; 32].into(),
                voted_proposal: Vec::new(),
            }
        }
    }

    // Vote Enum
    #[derive(Debug, scale::Decode, scale::Encode, Eq, PartialEq, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum Vote {
        Aye,
        Nye,
    }

    #[ink(storage)]
    pub struct Voting {
        owner: AccountId,
        proposal_id: ProposalId,
        user_id: UserId,
        active_proposal: i32,

        proposal: Mapping<ProposalId, Proposal>,
        user: Mapping<UserId, User>,
        voted: Mapping<(AccountId, ProposalId), bool>,
    }

    // Custom Error handler
    #[derive(Debug, scale::Decode, scale::Encode, Eq, PartialEq, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum ProposalError {
        NotOwner,
        ProposalNotFound,
        AccountNotRegistered,
        ProposalStatusError,
        AlreadyVoted,
        ShortNameLen,
        ReachAcitveProposalLimit,
        StatusNotAgreed,
        VotingFinishedAlready,
        ProposalNotExsits,
    }

    // Voting Proposal Event
    #[ink(event)]
    pub struct ProposalCreated {
        #[ink(topic)]
        pub proposal: Proposal,
    }

    #[ink(event)]
    pub struct UserCreated {
        #[ink(topic)]
        pub user: User,
    }

    #[ink(event)]
    pub struct ProposalStatusChanged {
        #[ink(topic)]
        pub proposal: Proposal,
    }

    #[ink(event)]
    pub struct ProposalVoted {
        #[ink(topic)]
        pub proposal: String,
    }

    impl Voting {
        #[ink(constructor)]
        pub fn new() -> Self {
            let caller = Self::env().caller();
            Self {
                owner: caller,
                proposal: Mapping::default(),
                user: Mapping::default(),
                proposal_id: Default::default(),
                user_id: Default::default(),
                voted: Mapping::default(),
                active_proposal: 1,
            }
        }

        // Create a new proposal
        #[ink(message)]
        pub fn create_proposal(&mut self, proposal_name: String) -> Result<(), ProposalError> {
            // Check whether caller is owner or not
            ensure!(
                self.check_owner(self.env().caller()),
                ProposalError::NotOwner
            );

            let proposal_id = self.get_next_id();
            let proposal = Proposal {
                proposal_name,
                vote_aye: 0,
                vote_nye: 0,
                total_vote: 0,
                proposal_status: false,
                voting_finished: false,
                id: proposal_id,
            };

            self.proposal.insert(proposal_id, &proposal);
            self.env().emit_event(ProposalCreated { proposal });
            Ok(())
        }

        // Change proposal status
        #[ink(message)]
        pub fn change_proposal_status(&mut self, id: ProposalId) -> Result<(), ProposalError> {
            // Check whether caller is owner or not
            ensure!(
                self.check_owner(self.env().caller()),
                ProposalError::NotOwner
            );

            // Check whether actival proposal limit is reached
            ensure!(
                self.active_proposal <= 1,
                ProposalError::ReachAcitveProposalLimit
            );

            let proposal = self.proposal.get(id);

            // check if proposal exists
            // ensure!(Some(proposal), ProposalError::ProposalNotExsits);

            match proposal {
                None => return Err(ProposalError::AccountNotRegistered),
                Some(v) => {
                    // check proposal not removed from voting
                    ensure!(!v.voting_finished, ProposalError::VotingFinishedAlready);
                    let p = Proposal {
                        proposal_name: v.proposal_name,
                        vote_aye: 0,
                        vote_nye: 0,
                        total_vote: 0,
                        // proposal_status: !v.proposal_status,
                        proposal_status: true,
                        voting_finished: false,
                        id: v.id,
                    };
                    self.proposal.insert(id, &p);
                    self.active_proposal += 1;
                }
            }
            // self.env().emit_event(ProposalStatusChanged {proposal: proposal.unwrap_or_default()});

            Ok(())
        }

        #[ink(message)]
        pub fn remove_active_proposal(&mut self, id: ProposalId) -> Result<(), ProposalError> {
            let proposal = self.proposal.get(id);
            // Check whether caller is owner or not
            ensure!(
                self.check_owner(self.env().caller()),
                ProposalError::NotOwner
            );

            match proposal {
                None => (),
                Some(v) => {
                    ensure!(v.proposal_status == true, ProposalError::StatusNotAgreed);
                    ensure!(
                        v.voting_finished == false,
                        ProposalError::VotingFinishedAlready
                    );

                    let p = Proposal {
                        proposal_name: v.proposal_name,
                        vote_aye: v.vote_aye,
                        vote_nye: v.vote_nye,
                        total_vote: v.total_vote,
                        // proposal_status: !v.proposal_status,
                        proposal_status: v.proposal_status,
                        voting_finished: true,
                        id: v.id,
                    };
                    self.proposal.insert(id, &p);
                }
            }
            self.active_proposal = 1;

            // self.env().emit_event(ProposalStatusChanged {proposal: proposal.unwrap_or_default()});

            Ok(())
        }

        // any user can Register with `AccountId` & `String`
        #[ink(message)]
        pub fn register_user(
            &mut self,
            user_account: AccountId,
            user_name: String,
        ) -> Result<(), ProposalError> {
            // ensure!(self.check_owner(self.env().caller()), ProposalError::NotOwner);

            // check name length
            ensure!(user_name.len() >= 3, ProposalError::ShortNameLen);

            let user = User {
                user_name,
                user_account,
                voted_proposal: Default::default(),
            };

            let uid = self.get_next_userid();

            self.user.insert(uid, &user);
            self.env().emit_event(UserCreated { user });

            Ok(())
        }

        // Vote proposal

        #[ink(message)]
        pub fn vote_proposal(&mut self, vote: Vote, id: ProposalId) -> Result<(), ProposalError> {
            let proposal = self.proposal.get(id).unwrap_or_default();
            let caller = self.env().caller();

            // check whether proposal status true or false. if true, then ok
            ensure!(proposal.proposal_status, ProposalError::ProposalStatusError);

            // check whether proposal voting not finished
            ensure!(
                !proposal.voting_finished,
                ProposalError::VotingFinishedAlready
            );

            // check whether account registered or not
            ensure!(
                self.check_register_user(caller),
                ProposalError::AccountNotRegistered
            );

            let is_voted = self.voted.get((caller, id)).unwrap_or_default();
            if is_voted {
                return Err(ProposalError::AlreadyVoted);
            }
            debug_print!("is voted: {}", is_voted);

            match vote {
                Vote::Aye => {
                    let p = Proposal {
                        proposal_name: proposal.proposal_name,
                        vote_aye: proposal.vote_aye + 1,
                        vote_nye: proposal.vote_nye,
                        total_vote: proposal.total_vote + 1,
                        proposal_status: proposal.proposal_status,
                        voting_finished: proposal.voting_finished,
                        id: proposal.id,
                    };
                    self.proposal.insert(id, &p);
                    self.voted.insert((caller, id), &true);
                }
                Vote::Nye => {
                    let p = Proposal {
                        proposal_name: proposal.proposal_name,
                        vote_aye: proposal.vote_aye,
                        vote_nye: proposal.vote_nye + 1,
                        total_vote: proposal.total_vote + 1,
                        proposal_status: proposal.proposal_status,
                        voting_finished: proposal.voting_finished,
                        id: proposal.id,
                    };
                    self.proposal.insert(id, &p);
                    self.voted.insert((caller, id), &true);
                    // proposal.vote_nye += 1;
                }
            }

            Ok(())
        }

        // Get active proposal
        #[ink(message)]
        pub fn get_active_proposal(&mut self) -> Vec<Proposal> {
            let mut active_result: Vec<Proposal> = Vec::new();
            for i in 0..self.proposal_id {
                match self.proposal.get(i) {
                    Some(value) => {
                        if value.proposal_status == true {
                            active_result.push(value)
                        }
                    }
                    None => (),
                }
            }
            active_result
        }

        // Get all proposal
        #[ink(message)]
        pub fn get_all_proposal(&mut self) -> Vec<Proposal> {
            let mut result: Vec<Proposal> = Vec::new();
            for i in 0..self.proposal_id {
                match self.proposal.get(i) {
                    Some(value) => result.push(value),
                    None => (),
                }
            }
            result
        }

        // Get all register users
        #[ink(message)]
        pub fn get_all_users(&mut self) -> Vec<User> {
            let mut result: Vec<User> = Vec::new();
            for i in 0..self.user_id {
                match self.user.get(i) {
                    Some(value) => result.push(value),
                    None => (),
                }
            }
            result
        }

        // Generate next proposal id by incrementing with 1
        pub fn get_next_id(&mut self) -> ProposalId {
            let id = self.proposal_id;
            self.proposal_id += 1;
            id
        }

        // Generate new user id by increment with 1
        pub fn get_next_userid(&mut self) -> UserId {
            let id = self.user_id;
            self.user_id += 1;
            id
        }

        // Check owner
        pub fn check_owner(&self, user: AccountId) -> bool {
            if self.owner == user {
                true
            } else {
                false
            }
        }

        // Check if user registered or not
        pub fn check_register_user(&mut self, caller: AccountId) -> bool {
            let user = self.get_all_users();
            let mut _ruser = false;

            for u in user.iter() {
                if u.user_account == caller {
                    _ruser = true;
                    break;
                }
            }

            _ruser
        }

        #[ink(message)]
        pub fn get_account_id(&self) -> AccountId {
            self.owner.clone()
        }
    }
}
