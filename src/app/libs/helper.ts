export const getQueryParam = (url: string, key:string) => {
  key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+key+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( url );
  if( results == null )
    return "";
  else
    return results[1];
}

export const forceBiggerThenOneNumber = (value: number, defaultNum: number = 1) => (isNaN(value) || value < 1) ? defaultNum : value;
