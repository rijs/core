export default {
  header: 'text/plain'
, check(res){ return !includes('.html')(res.name) && !includes('.css')(res.name) && is.str(res.body) }
}

import includes from 'utilise/includes'
import is from 'utilise/is'