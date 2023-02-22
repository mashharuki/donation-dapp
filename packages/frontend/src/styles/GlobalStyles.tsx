import { Global } from '@emotion/react'
import { css } from '@emotion/react'
import 'nprogress/nprogress.css'
import 'antd/dist/reset.css'

const customStyles = css`
  html {
    font-size: 16px;
    font-family: 'Inter', sans-serif;
    line-height: 1.5;
  }
`

const GlobalStyles = () => (
  <>
    <Global styles={customStyles} />
  </>
)

export default GlobalStyles
