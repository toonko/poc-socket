<template lang="pug">
  div 
    .login-page.p-5
      button.mx-2(@click="login(0)") login test1
      button.mx-2(@click="login(1)") login test2
      button.mx-2(@click="login(2)") login test3

</template>

<script>
import io from 'socket.io-client'
var cookie = require('cookie')

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
    async login (index) {
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

        // document.cookie = `X-CSRFTOKEN=${csrfToken}; path=/`
        console.log('document.cookie', document.cookie)

        var setCookie = cookie.serialize('csrfToken', csrfToken)
        // foo=bar


        // const link = 'ws://localhost:3000'
        const link = 'wss://fah.conicle.com'

        this.webSocket = new WebSocket(`${link}/ws/chat/1313/`)
        console.log('this.webSocket', this.webSocket)
        
        this.webSocket.onopen = async (event) => {
          console.log('[Fah\'s Socket: onopen]', event)
          this.webSocket.send(JSON.stringify({ message: 'hello' }))
        }
        this.webSocket.onerror = (error) => console.log('[Fah\'s Socket: error]', error)
        this.webSocket.onmessage = (event) => { 
          console.log('[Fah\'s Socket: onmessage]', event.data) 
          // console.log('event', event) 
        }
      
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