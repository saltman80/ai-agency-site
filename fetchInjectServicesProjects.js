async function loadJson(path){
    const response = await fetch(path);
    if(!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
    return response.json();
  }
  function validateServicesData(data){
    if(!Array.isArray(data)){
      console.warn('Invalid services data: expected an array.');
      return [];
    }
    return data.filter((item,index)=>{
      const{title,description,icon,link}=item;
      const valid=typeof title==='string'&&typeof description==='string'&&typeof icon==='string';
      if(!valid){console.warn(`Invalid service entry at index ${index}`,item);return false;}
      if(link&&typeof link!=='string'){console.warn(`Invalid service link at index ${index}`,link);delete item.link;}
      return true;
    });
  }
  function validateProjectsData(data){
    if(!Array.isArray(data)){
      console.warn('Invalid projects data: expected an array.');
      return [];
    }
    return data.filter((item,index)=>{
      const{title,description,image,tags,link}=item;
      const validTags=Array.isArray(tags)&&tags.every(tag=>typeof tag==='string');
      const valid=typeof title==='string'&&typeof description==='string'&&typeof image==='string'&&validTags;
      if(!valid){console.warn(`Invalid project entry at index ${index}`,item);return false;}
      if(link&&typeof link!=='string'){console.warn(`Invalid project link at index ${index}`,link);delete item.link;}
      return true;
    });
  }
  function showError(container,sectionName){
    if(!container) return;
    container.innerHTML='';
    const msg=document.createElement('p');
    msg.className='data-error';
    msg.textContent=`Unable to load ${sectionName}. Please try again later.`;
    container.appendChild(msg);
  }
  function renderServices(services){
    const container=document.getElementById('services-container');
    if(!container) return;
    container.innerHTML='';
    services.forEach(item=>{
      const{title='',description='',icon,link}=item;
      const card=document.createElement('div');
      card.className='service-card reveal';
      const iconEl=document.createElement('div');
      iconEl.className='service-card__icon';
      if(typeof icon==='string'){
        const trimmed=icon.trim();
        if(trimmed.startsWith('<')){
          const doc=new DOMParser().parseFromString(icon,'text/html');
          const imgTag=doc.querySelector('img');
          if(imgTag){iconEl.appendChild(imgTag);}
          else{
            const svgTag=doc.querySelector('svg');
            if(svgTag){
              svgTag.querySelectorAll('script').forEach(el=>el.remove());
              const walker=document.createTreeWalker(svgTag,NodeFilter.SHOW_ELEMENT,null,false);
              let node=walker.nextNode();
              while(node){
                [...node.attributes].forEach(attr=>{if(attr.name.startsWith('on'))node.removeAttribute(attr.name);});
                node=walker.nextNode();
              }
              iconEl.appendChild(svgTag);
            } else {
              const img=document.createElement('img');
              img.src=trimmed;img.alt=title;
              iconEl.appendChild(img);
            }
          }
        } else {
          const img=document.createElement('img');
          img.src=trimmed;img.alt=title;
          iconEl.appendChild(img);
        }
      }
      const h3=document.createElement('h3');
      h3.className='service-card__title';h3.textContent=title;
      const p=document.createElement('p');
      p.className='service-card__description';p.textContent=description;
      card.append(iconEl,h3,p);
      if(link){
        const a=document.createElement('a');
        a.className='service-card__link';a.href=link;a.target='_blank';a.rel='noopener';a.textContent='Learn More';
        card.appendChild(a);
      }
      container.appendChild(card);
    });
  }
  function renderProjects(projects){
    const container=document.getElementById('projects-container');
    if(!container) return;
    container.innerHTML='';
    projects.forEach(item=>{
      const{title='',description='',image,link,tags=[]}=item;
      const slide=document.createElement('div');
      slide.className='project-slide reveal';
      const imgWrap=document.createElement('div');
      imgWrap.className='project-slide__image';
      if(image){
        const img=document.createElement('img');
        img.src=image;img.alt=title;
        imgWrap.appendChild(img);
      }
      const content=document.createElement('div');
      content.className='project-slide__content';
      const h3=document.createElement('h3');
      h3.className='project-slide__title';h3.textContent=title;
      const p=document.createElement('p');
      p.className='project-slide__description';p.textContent=description;
      content.append(h3,p);
      if(tags.length){
        const tagList=document.createElement('div');
        tagList.className='project-slide__tags';
        tags.forEach(tag=>{
          const span=document.createElement('span');
          span.className='project-slide__tag';span.textContent=tag;
          tagList.appendChild(span);
        });
        content.appendChild(tagList);
      }
      if(link){
        const a=document.createElement('a');
        a.className='project-slide__link';a.href=link;a.target='_blank';a.rel='noopener';a.textContent='View Project';
        content.appendChild(a);
      }
      slide.append(imgWrap,content);
      container.appendChild(slide);
    });
  }
  const observer=new IntersectionObserver((entries,obs)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  },{threshold:0.2});
  function initReveal(){document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
  document.addEventListener('DOMContentLoaded',()=>{
    const servicesContainer=document.getElementById('services-container');
    const projectsContainer=document.getElementById('projects-container');
    const servicesPromise=loadJson('services.json')
      .then(validateServicesData)
      .then(renderServices)
      .catch(err=>{
        console.error('Error loading services:',err);
        showError(servicesContainer,'services');
      });
    const projectsPromise=loadJson('projects.json')
      .then(validateProjectsData)
      .then(renderProjects)
      .catch(err=>{
        console.error('Error loading projects:',err);
        showError(projectsContainer,'projects');
      });
    Promise.allSettled([servicesPromise,projectsPromise]).then(initReveal);
  });