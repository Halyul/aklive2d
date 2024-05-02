export default function check_web_gl() {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return ctx != null;
  } catch (e) {
    return false;
  }
}