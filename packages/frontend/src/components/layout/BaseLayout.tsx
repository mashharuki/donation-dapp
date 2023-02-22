import { FC, PropsWithChildren } from 'react'
import { Layout, Divider } from 'antd'
import { ChainInfo } from '@components/web3/ChainInfo'
import { ConnectButton } from '@components/web3/ConnectButton'

const { Header, Footer, Sider, Content } = Layout

const contentStyle: React.CSSProperties = {
  textAlign: 'center',
  minHeight: 120,
  lineHeight: '120px',
  color: '#fff',
  margin: 'auto',
  padding: '1rem',
}

export const BaseLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider style={{ padding: '1rem' }}>
        <ChainInfo />
        <Divider />
        <ConnectButton />
      </Sider>
      <Content style={contentStyle}>{children}</Content>
    </Layout>
  )
}
