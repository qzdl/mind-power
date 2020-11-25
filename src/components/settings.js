class Settings {
  static unit(v) {
    return  (v + "px")
  }

  static isDebug = true

  static debug(func, data) {
    if (Settings.isDebug)
      console.log(func, data)
  }
}

export default Settings;
