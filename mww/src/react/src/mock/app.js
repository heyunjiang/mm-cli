const Mock = require('mockjs')

module.exports = {
  'GET /plmPortal/user/getLoginUserInfo':  (req, res) => {
    res.status(200).json({userInfo: {username: '吴彦祖', name: '彦祖', surname: '吴', useYht: true}})
  },
  'POST /plmPortal/changePassword.do':  (req, res) => {
    res.status(200).json('S')
  }
}
