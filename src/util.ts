export function random(len : number){
    const options = "ad2adasdsadasznxczxcn02934174831";
    const length = options.length;
    let ans= "";
    for(let i=0; i<len; i++){
        ans = ans + options[Math.floor((Math.random() * length))]
    }
    return ans;
}