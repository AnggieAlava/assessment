export const isWindow = typeof window !== 'undefined';
const getQueryString = (key, def) => {
  const urlParams = isWindow && new URLSearchParams(window.location.search);
  return urlParams && (urlParams.get(key) || def);
};

function updateQueryStringWithCurrentURLParams(targetUrl) {

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

    // Delete ua_token because its probably going to forward to another quiz / user assessment
    targetUrlObj.searchParams.delete('ua_token');
    return targetUrlObj.toString();
  }
}

export {
  getQueryString, updateQueryStringWithCurrentURLParams,
}