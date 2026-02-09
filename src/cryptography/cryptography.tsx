import * as CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY

export const encrypt = (message: string): string => {
  const encryptedPhoneNumber = CryptoJS.AES.encrypt(
    message,
    ENCRYPTION_KEY,
  ).toString()
  return encryptedPhoneNumber
}

export const decrypt = (ciphertext: string): string => {
  const decryptedMessage = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY)
  return decryptedMessage.toString(CryptoJS.enc.Utf8)
}
