export default function createFetcher(f){
    var cache = {}
    return {
        read(...args){
            var key  = args.join('|')
            if( key in cache ){
                return cache[key]
            }else{
                throw f(...args).then(val =>{
                    cache[key] = val
                })
            }
        }
    }
}