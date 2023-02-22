import React from 'react'
import { DownOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { Button, Divider, Dropdown, Space, theme } from 'antd'
import type { MenuProps } from 'antd'

import { env } from '@config/environment'
import { getSubstrateChain, SubstrateChain, useBalance, useInkathon } from '@scio-labs/use-inkathon'
import { truncateHash } from '@utils/truncateHash'
import { FC, useState } from 'react'
import 'twin.macro'

export interface ConnectButtonProps {}

export const ConnectButton: FC<ConnectButtonProps> = () => {
  const { token } = theme.useToken()

  const {
    activeChain,
    setActiveChain,
    connect,
    disconnect,
    isConnecting,
    account,
    accounts,
    setAccount,
  } = useInkathon()
  const { balanceFormatted } = useBalance(account?.address)
  const [supportedChains] = useState(
    env.supportedChains.map((networkId) => getSubstrateChain(networkId) as SubstrateChain),
  )

  // Connect Button
  if (!account)
    return (
      <Button type="primary" onClick={connect} loading={isConnecting}>
        Connect Wallet
      </Button>
    )

  const chains: MenuProps['items'] = supportedChains.map((chain, i) => ({
    label: (
      <Space>
        {chain.name}
        {chain?.network === activeChain?.network && (
          <CheckCircleOutlined style={{ color: 'green' }} />
        )}
      </Space>
    ),
    key: i,
    icon: <UserOutlined />,
    onClick: () => {
      setActiveChain?.(chain)
    },
  }))

  const accountItems: MenuProps['items'] = accounts?.map((item, i) => ({
    label: (
      <>
        <Space>
          {item?.meta.name}
          {item?.address === account?.address && <CheckCircleOutlined style={{ color: 'green' }} />}
        </Space>
        <div>{truncateHash(item.address, 8)}</div>
      </>
    ),
    key: i,
    icon: <UserOutlined />,
    onClick: () => {
      setAccount?.(item)
    },
  }))

  const contentStyle = {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowSecondary,
  }

  return (
    <>
      <Dropdown
        menu={{ items: chains }}
        dropdownRender={(menu) => {
          return <div style={contentStyle}>{React.cloneElement(menu as React.ReactElement)}</div>
        }}
      >
        <Button type="primary" onClick={(e) => e.preventDefault()}>
          <Space>
            Supported chains
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>
      <Divider />
      <Dropdown
        menu={{ items: accountItems }}
        dropdownRender={(menu) => {
          return (
            <div style={contentStyle}>
              {React.cloneElement(menu as React.ReactElement)}
              <Divider style={{ margin: 0 }} />
              <Space style={{ padding: 8 }}>
                <Button type="primary" onClick={disconnect}>
                  Disconnect
                </Button>
              </Space>
            </div>
          )
        }}
      >
        <Button type="primary" onClick={(e) => e.preventDefault()}>
          <Space>
            Accounts
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>
    </>
  )
}
