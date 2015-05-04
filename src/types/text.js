export default {
  header: 'text/plain'
, check(res){ return is.str(res.body) }
}

import is from 'utilise/is'