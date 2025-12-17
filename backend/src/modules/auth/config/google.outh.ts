import { registerAs } from "@nestjs/config"
 

export default registerAs('googleOauth', () => ({
  clientId: process.env.Google_Client_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackUrl: process.env.GOOGLE_Callback_URL,
}))