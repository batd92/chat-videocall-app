// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js')
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js',
)

importScripts('./env.js')

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

// messaging.onBackgroundMessage(function (payload) {
//   const notificationTitle = payload.notification.title
//   const notificationOptions = {
//     body: payload.notification.body,
//   }

//   // self.registration.showNotification(notificationTitle, notificationOptions)
// })
