import device from '../assets/images/public-service-device.jpg'
import digitalUser from '../assets/images/digital-service-user.jpg'
import hands from '../assets/images/hands-communication.jpg'
import information from '../assets/images/public-information.jpg'
import partner from '../assets/images/service-partner.jpg'
import signing from '../assets/images/signing-gesture.jpg'
import signingUser from '../assets/images/signing-user.jpg'
import welcome from '../assets/images/welcome-gesture.jpg'

export const IMG = {
  hero: device,
  consult: digitalUser,
  signing,
  hands,
  psikolog: partner,
  group: signingUser,
  clinic: device,
  device: digitalUser,
  laptop: device,
  light: information,
  smile: welcome,
} as const
