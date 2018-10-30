/* global window */
import React from 'react'
import PropTypes from 'prop-types'
import pathToRegexp from 'path-to-regexp'
import { connect } from '../dva'
import './app.less'

const App = ({children}) => {
  return (
    <div>
      {children}
    </div>
  )
}

App.propTypes = {
  children: PropTypes.element.isRequired,
  location: PropTypes.object,
  pathname: PropTypes.string,
  dispatch: PropTypes.func,
  app: PropTypes.object,
  loading: PropTypes.object,
}

export default connect(state => ({
  app: state.app,
  loading: state.loading,
  location: state.router.location
}))(App)
