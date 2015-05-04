export default {
  header: 'application/javascript'
, check(res){ return is.fn(res.body) }
, inflate(res){ res.body = fn(res.body) }
}

import is from 'utilise/is'
import fn from 'utilise/fn'