const sourceLink=document.querySelector('[data-repository-link]');
if(sourceLink&&location.hostname.endsWith('.github.io')){
  const owner=location.hostname.slice(0,-'.github.io'.length);
  sourceLink.href=`https://github.com/${owner}/trip-planner-extension`;
}
