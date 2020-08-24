<template lang="pug">
  div 
    .login-page.p-5
      button.mx-2(@click="login(0)") login test1
      button.mx-2(@click="login(1)") login test2
      button.mx-2(@click="login(2)") login test3

</template>

<script>
import io from 'socket.io-client'

export default {
  data () {
    return {
      accounts: [ 
        { username: 'test1', password: '1234' },
        { username: 'test2', password: '1234' },
        { username: 'test3', password: '1234' }
      ],
      webSocket: null
    }
  },
  methods: {
    connectWebSocket (link) {
      const csrfToken = this.getCookie('csrftoken', document.cookie)
      this.webSocket = new WebSocket(`${link}/ws/chat/1/`)
      console.log('this.webSocket', this.webSocket)
      this.webSocket.onopen = (event) => console.log('[Fah\'s Socket: onopen]', event)
      this.webSocket.onerror = (error) => console.log('[Fah\'s Socket: error]', error)
      this.webSocket.onmessage = (event) => { console.log('[Fah\'s Socket: onmessage]', event.data) }
    },
    async login (index) {
      this.submitLogin(index)
      // await this.connectWebSocket('wss://fah.conicle.com')
      // await this.connectWebSocket('wss://192.168.50.51:8000')
    },
    async submitLogin (index) {
      let res = await this.$axios({
        method: 'post',
        url: '/api/account/login/',
        data: {
          username: this.accounts[index].username,
          password: this.accounts[index].password
        }
      })
      console.log('res', res)
      const csrfToken = this.getCookie('csrftoken', document.cookie)
      

      // document.cookie = `X-Authorization=${csrfToken}; path=/`
      document.cookie = `X-CSRFTOKEN=${csrfToken}; path=/`
      console.log('document.cookie', document.cookie)
      // sessionStorage.setItem("headers", csrfToken);

      // this.connectWebSocket('wss://192.168.50.51:8002')
      // const link = 'ws://192.168.50.51:8002'

      const link = 'wss://fah.conicle.com'

      this.webSocket = new WebSocket(`${link}/ws/chat/1313/`, [],  { 'headers': { 'Cookie': document.cookie }})
      // console.log('this.webSocket', this.webSocket)
      
      this.webSocket.onopen = async (event) => {
        console.log('[Fah\'s Socket: onopen]', event)
        const { target: webSocket } = event
        webSocket.send(JSON.stringify({ message: 'hello' }))
        this.webSocket.send(JSON.stringify({ message: 'hello' }))
      }
      this.webSocket.onerror = (error) => console.log('[Fah\'s Socket: error]', error)
      this.webSocket.onmessage = (event) => { console.log('[Fah\'s Socket: onmessage]', event.data, event) }

      // middleware
      // io.use((socket, next) => {
      //   let clientId = socket.handshake.headers['x-clientid'];
      //   if (isValid(clientId)) {
      //     return next();
      //   }
      //   return next(new Error('authentication error'));
      // });

      // const socket = io(link, { path: '/ws/chat/1/', transports: ['websocket'] })

      
      // console.log('socket', socket)
      // socket.on('connect', (event) => console.log('connect', event));
      // socket.on('disconnect', (event) => console.log('disconnect', event));


      // this.$router.push(`/?account=${res.data.id}`)
    },
    getCookie (name, src) {
      let cookieValue = null
      if (src !== '') {
        let cookies = src.split(';')
        for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i].trim()
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === name + '=') {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
            break
          }
        }
      }
      return cookieValue
    },
  }
}
</script>