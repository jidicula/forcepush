import styled from "@emotion/styled"
import React from "react"

type ProductProps = {
  imagePath: string
  mainTitle: string
  subTitle: string
  children: React.ReactNode
}

const ProductContainer = styled.div`
  padding: 0px 15px 0px 15px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  @media only screen and (max-width: 450px) {
    justify-content: center;
  }
`

const ProductImage = styled.img`
  flex-basis: 18%;
  padding: 15px 30px 15px 15px;
  align-self: center;
  max-width: 25%;
  @media only screen and (max-width: 450px) {
    max-width: 80%;
  }
`

const ProductCaption = styled.div`
  flex-basis: 70%;
  align-self: center;
  padding: 20px 0px 20px 0px;
  h2 {
    margin: 0;
    word-break: break-word;
  }
  h4 {
    margin: 0;
    word-break: break-word;
    font-weight: 400;
  }
`

export default function Product(props: ProductProps) {
  const { imagePath, mainTitle, subTitle, children } = props

  return (
    <ProductContainer>
      <ProductImage src={imagePath} alt={mainTitle} />
      <ProductCaption>
        <h2>{mainTitle}</h2>
        <h4>{subTitle}</h4>
        <div>{children}</div>
      </ProductCaption>
    </ProductContainer>
  )
}
