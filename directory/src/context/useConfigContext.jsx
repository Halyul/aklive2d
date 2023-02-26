import { createContext, useState, useEffect } from "react"

export const ConfigContext = createContext()

export function ConfigProvider(props) {
  const [config, setConfig] = useState([])

  useEffect(() => {
    fetch("/_assets/directory.json").then(res => res.json()).then(data => {
      setConfig(data)
    })
  }, [])

  return (
    <ConfigContext.Provider value={{ config }}>
      {props.children}
    </ConfigContext.Provider>
  )
}