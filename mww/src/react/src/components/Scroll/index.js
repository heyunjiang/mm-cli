/*
 * name: 滚动组件
 * 功能：移动端顺畅滚动、上拉刷新
 * 版本：2
 * designer：heyunjiang
 * start at: 2018.3.9
 * update: 2018.6.6
 * update-content-2018.6.6: 
 * 1.使用 react-custom-scrollbars 替换 react-scrollbar ，解决safari滚动穿透及不流畅问题
 */

import React, { cloneElement } from 'react'
import PropTypes from 'prop-types'
import { Scrollbars } from 'react-custom-scrollbars'
import Style from './index.less'

const scroll = ({children, scrollFunc})=>{
  return (
    <div className='commonScrollCardBoxPoor'>
      <Scrollbars className='commonScrollCardBoxContainer' onScrollFrame={(value)=>scrollFunc(value)}>
        {children}
      </Scrollbars>
    </div>
  )
}

scroll.propTypes = {
  children: PropTypes.element.isRequired,
  scrollFunc: PropTypes.func,
}
scroll.defaultProps = {
    scrollFunc: ()=>{},
}

//1. 设置only child : PropTypes.element
//
//2. 设置propTypes 子项的propTypes

export default scroll
