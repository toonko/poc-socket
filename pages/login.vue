<template lang="pug">
  div 
    .login-page.p-5
      button.mx-2(@click="login(0)") login test1
      button.mx-2(@click="login(1)") login test2
      button.mx-2(@click="login(2)") login test3

</template>

<script>
export default {
  data () {
    return {
      accounts: [ 
        { username: 'test1', password: '1234' },
        { username: 'test2', password: '1234' },
        { username: 'test3', password: '1234' }
      ]
    }
  },
  methods: {
    login (index) {
      this.$axios({
        method: 'post',
        url: '/api/account/login/',
        data: {
          username: this.accounts[index].username,
          password: this.accounts[index].password
        }
      }).then(res => {
        console.log('res', res.data)
        this.$router.push(`/?account=${res.data.id}`)
      })
    }
  }
}
</script>