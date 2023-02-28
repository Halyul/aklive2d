import { createContext, useState, useEffect } from "react"
import db from "@/db"

export const ConfigContext = createContext()

export function ConfigProvider(props) {
  const [config, setConfig] = useState([])
  const [operators, setOperators] = useState([])

  useEffect(() => {
    fetch("/_assets/directory.json").then(res => res.json()).then(data => {
      setConfig(data)
      db.config.put({ key: "config", value: data })
      let operatorsList = []
      data.operators.forEach((item) => {
        operatorsList = [...operatorsList, ...item]
      })
      setOperators(operatorsList)
    })
    fetch("/_assets/version.json").then(res => res.json()).then(data => {
      db.config.put({ key: "version", value: data })
    })
  }, [])

  return (
    <ConfigContext.Provider value={{ config, operators }}>
      {props.children}
    </ConfigContext.Provider>
  )
}