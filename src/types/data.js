export default {
  header: 'application/data'
, check(res){ return true }
, inflate(res){ 
    !res.body && (res.body = [])
    emitterify(res.body)
    res.headers = { 
      'content-type'    : 'application/data'
    // , 'content-location': res.headers['content-location'] || res.headers['table'] || res.name
    // , 'proxy-to'        : res.headers['proxy-to'] || res.headers['to']
    // , 'proxy-from'      : res.headers['proxy-from'] || res.headers['from']
    // , 'version'         : res.headers['version']
    // , 'max-versions'    : is.num(header('max-versions')(res)) ? header('max-versions')(res) 
    //                     : Infinity
    // , 'cache-control'   : is.null(res.headers['cache']) ? 'no-store' 
    //                     : res.headers['cache-control'] || res.headers['cache']
    }

    // keys(res.headers)
    //   .filter(k => !is.def(res.headers[k]))
    //   .map(k => delete res.headers[k])
  }
}

import emitterify from 'utilise/emitterify'
import header from 'utilise/header'
import keys from 'utilise/keys'
import is from 'utilise/is'