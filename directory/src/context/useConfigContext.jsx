import { createContext, useState, useEffect, useCallback } from "react"
import db, { invalidateCache } from "@/db"

const versionCompare = (v1, v2) => {
  const v1Arr = v1.split(".")
  const v2Arr = v2.split(".")
  for (let i = 0; i < v1Arr.length; i++) {
    if (v1Arr[i] > v2Arr[i]) {
      return 1
    } else if (v1Arr[i] < v2Arr[i]) {
      return -1
    }
  }
  return 0
}

const invalidateRules = (local, version) => {
  if (local === undefined) {
    // no local version
    return true
  }
  if (version === undefined) {
    // no remote version
    return false
  }
  return versionCompare(local, version) < 0
}

export const ConfigContext = createContext()

export function ConfigProvider(props) {
  const [config, setConfig] = useState([])
  const [operators, setOperators] = useState([])
  const [version, setVersion] = useState({})

  const fetchConfig = (version) => {
    fetch("/_assets/directory.json").then(res => res.json()).then(data => {
      setConfig(data)
      db.config.put({ key: "config", value: data })
      resolveOperators(data)
      db.config.put({ key: "version", value: version })
    })
  }

  const resolveOperators = useCallback((data) => {
    let operatorsList = []
    data.operators.forEach((item) => {
      operatorsList = [...operatorsList, ...item]
    })
    setOperators(operatorsList)
  }, [])

  useEffect(() => {
    fetch("/_assets/version.json").then(res => res.json()).then(data => {
      db.config.get({ key: "version" }).then((local) => {
        if (local === undefined || invalidateRules(local.value.directory, data.directory) || invalidateRules(local.value.showcase, data.showcase)) {
          invalidateCache()
          fetchConfig(data)
        } else {
          db.config.get({ key: "config" }).then((local) => {
            if (local) {
              setConfig(local.value)
              resolveOperators(local.value)
            } else {
              fetchConfig(data)
            }
          })
        }
      })
      setVersion(data)
    })
    /*
        local.directory | version.directory | action
        --------------- | ----------------- | ------
        1.0.0           | 1.0.0             | use cache
        1.0.0           | 1.0.1             | invalidate cache
        1.0.1           | 1.0.0             | impossible

        local.showcase | version.showcase | action
        -------------- | ---------------- | ------
        1.0.0          | 1.0.0            | use cache
        1.0.0          | 1.0.1            | invalidate cache
        1.0.1          | 1.0.0            | use cache
    */
  }, [])

  return (
    <ConfigContext.Provider value={{ config, operators, version }}>
      {props.children}
    </ConfigContext.Provider>
  )
}