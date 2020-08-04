import styled from "@emotion/styled"
import React from "react"

type InsertProps = {
  children: React.ReactNode
}

const InsertContainer = styled.div`
  border: 2px solid grey;
  border-radius: 18px;
  margin: 35px 35px 35px 35px;
`

export default function Insert(props: InsertProps) {
  const { children } = props
  return <InsertContainer>{children}</InsertContainer>
}
