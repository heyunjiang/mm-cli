<template>
  <div>
    <group>
      <cell title="title" value="value"></cell>
      <XButton type="warn">test</XButton>
    </group>
  </div>
</template>

<script>
import { Group, Cell, XButton } from 'vux'

export default {
  components: {
    Group,
    Cell,
    XButton
  }
}
</script>