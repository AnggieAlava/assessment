export const isWindow = typeof window !== 'undefined';
const getQueryString = (key, def) => {
  const urlParams = isWindow && new URLSearchParams(window.location.search);
  return urlParams && (urlParams.get(key) || def);
};

function rand(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function updateQueryStringWithCurrentURLParams(targetUrl, aditionalParams={}) {

  if(!window || !targetUrl) return targetUrl;
  
  // Determine if the target URL is relative
  let isRelative = !targetUrl.startsWith('http://') && !targetUrl.startsWith('https://');

  if (isRelative) {
    // Extract the path and initial query string from the target URL
    let [path, queryString] = targetUrl.split('?');
    let finalQueryString = new URLSearchParams(queryString || '');

    // Extract current page query params and update/add to the target's query params
    const currentUrlParams = new URLSearchParams(window.location.search);
    currentUrlParams.forEach((value, key) => {
      finalQueryString.set(key, value);
    });

    // if there is any aditional params to add
    Object.keys(aditionalParams).forEach(key => finalQueryString.set(key, aditionalParams[key]));

    finalQueryString.delete('ua_token');
    // Reconstruct the target URL with updated query params
    let updatedUrl = `${path}?${finalQueryString.toString()}`;
    return updatedUrl;
  } else {
    // For absolute URLs, use the previous logic or handle differently as needed
    const targetUrlObj = new URL(targetUrl);
    const currentUrlParams = new URLSearchParams(window.location.search);
    currentUrlParams.forEach((value, key) => {
      targetUrlObj.searchParams.set(key, value);
    });

    // if there is any aditional params to add
    Object.keys(aditionalParams).forEach(key => targetUrlObj.searchParams.set(key, aditionalParams[key]));

    // Delete ua_token because its probably going to forward to another quiz / user assessment
    targetUrlObj.searchParams.delete('ua_token');
    return targetUrlObj.toString();
  }
}

const updateQueystring = (newParams) => {
  const currentUrl = new URL(window.location);
  const searchParams = currentUrl.searchParams;

  Object.keys(newParams).forEach(key => {
    if(!newParams[key]) searchParams.delete(key);
    else searchParams.set(key, newParams[key]); // 'newParam' is the query parameter you want to add or modify
  })
  
  history.pushState({}, '', currentUrl.toString());
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const parseQuery = (query, connector = false) => {
  let queryString = '';
  try {
    Object.keys(query).forEach((key) => {
      // query[key] !== undefined && query[key] !== null
      if (query[key] !== undefined) {
        if (connector) {
          queryString += `&${key}=${query[key]}`;
        }
        if (!connector && query[key] !== undefined) {
          queryString += `${queryString ? '&' : '?'}${key}=${query[key]}`;
        }
      }
    });
  } catch (e) {
    return console.error('🛠️ parseQuerys error:', e);
  }
  return queryString;
};

export {
  getQueryString, updateQueryStringWithCurrentURLParams, updateQueystring, parseQuery, capitalize, rand
}
