import validator from "validator";

export function isValidAsciiEmail(email) {
  const value = String(email || "");
  const isAscii = [...value].every((char) => char.charCodeAt(0) <= 127);
  return isAscii && validator.isEmail(value, {
    allow_utf8_local_part: false,
    require_tld: true,
  });
}
