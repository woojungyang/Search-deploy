/*************** Global init *****************/
var auth ='KakaoAK e385671e06ab429019b9dee19bb62d87';
var kakaoURL = 'https://dapi.kakao.com/';
var cate, query, page = 1;
var size = { web: 10, blog: 10, book: 10, cafe: 10, vclip: 15, image: 80 }
var observer;

/************** user function *************/
function getPath(cate) {
	return kakaoURL+(cate === 'book' ? 'v3' : 'v2')+'/search/'+cate;
}

function getParams(query) {
	return {
		params: { query: query, size: size[cate], page: page },
		headers: { Authorization: auth }
	}
}

function setTotalCnt(cnt) {
	$('.result-cnt').html(numberFormat(cnt));
}

function setWebLists(r) {
	$('.lists').empty().attr({'class': 'lists web', 'style': ''});
	r.forEach(function(v, i) {
		var html = '<li class="list">';
		html += '<a class="title" href="'+v.url+'" target="_blank">'+v.title+'</a>';
		html += '<p class="content">'+v.contents+'</p>';
		html += '<a class="link" href="'+v.url+'" target="_blank">'+v.url+'</a>';
		html += '<div class="dt">'+moment(v.datetime).format('YYYY-MM-DD HH:mm:ss')+'</div>';
		html += '</li>';
		$('.lists').append(html);
	});
}

function setBlogLists(r) {
	$('.lists').empty().attr({'class': 'lists blog', 'style': ''});
	var html = '';
	r.forEach(function(v, i) {
		html  = '<li class="list">';
		html += '<a class="thumbs" href="'+v.url+'" target="_blank">';
		html += '<img src="'+v.thumbnail+'" alt="'+v.title+'" class="w100">';
		html += '</a>';
		html += '<div class="contents">';
		html += '<a class="title" href="'+v.url+'" target="_blank">'+v.title+'</a>';
		html += '<p class="content">'+v.contents+'</p>';
		html += '<a class="name" href="'+v.url+'" target="_blank">'+v.blogname+'</a> | <a href="'+v.url+'" class="link" target="_blank">'+v.url+'</a>';
		html += '<div class="dt">'+moment(v.datetime).format('YYYY-MM-DD HH:mm:ss')+'</div>';
		html += '</div>';
		html += '</li>';
		$('.lists').append(html);
	});
}

function setImageLists(r) {
	$('.lists').empty().attr({'class': 'lists image grid-wrap', 'style': ''});
	$('.lists').append('<li class="list grid-sizer"></li>');
	r.forEach(function(v, i) {
		var info = JSON.stringify({
			collection: v.collection,
			width: v.width,
			height: v.height,
			src: v.image_url,
			thumb: v.thumbnail_url,
			name: v.display_sitename,
			url: v.doc_url,
			dt: v.datetime
		});
		var html = '<li class="list grid-item" data-info=\''+info+'\'>';
		html += '<img src="'+v.thumbnail_url+'" class="w100">';
		html += '<div class="info"></div>';
		html += '</li>';
		$(html).appendTo('.lists').click(onModalShow);
	});
	var $grid = $('.grid-wrap').masonry({
		itemSelector: '.grid-item',
		columnWidth: '.grid-sizer',
		percentPosition: true
	});
	$grid.imagesLoaded().progress(function() {
		$grid.masonry('layout');
		$grid.masonry('reloadItems');
	});
}

function setClipLists(r) {
	$('.lists').empty().attr({'class': 'lists clip', 'style': ''});
	var html = '';
	r.forEach(function(v, i) {
		html  = '<li class="list">';
		html += '<a class="thumbs" href="'+v.url+'" target="_blank">';
		html += ' <img src="'+v.thumbnail+'" alt="'+v.title+'" class="w100">';
		html += '</a>';
		html += '<div class="contents">';
		html += ' <a class="title" href="'+v.url+'" target="_blank">'+v.title+'</a>';
		html += ' <div>';
		html += '  <a class="author" href="'+v.url+'" target="_blank">'+v.author+'</a> | ';
		html += '  <span class="play-time">'+getPlayTime(v.play_time)+'</span>';
		html += ' </div>';
		html += ' <a href="'+v.url+'" class="link" target="_blank">'+v.url+'</a>';
		html += ' <div class="dt">'+moment(v.datetime).format('YYYY-MM-DD HH:mm:ss')+'</div>';
		html += '</div>';
		html += '</li>';
		$('.lists').append(html);
	});
}

function setBookLists(r) {
	$('.lists').empty().attr({'class': 'lists book', 'style': ''});
	var html = '';
	r.forEach(function(v, i) {
		var author = v.authors.join(', ');
		var thumbnail = v.thumbnail !== '' ? v.thumbnail : 'http://via.placeholder.com/120x174/eee?text=No+image';
		var translator = v.translators.join(', ');
		var salePrice = v.sale_price > -1 ? numberFormat(v.sale_price)+'???' : '????????????';
		var isbn = v.isbn.replace(' ', ' / ');
		var dt = moment(v.datetime).format('YYYY-MM-DD');
		html  = '<li class="list">';
		html += '<a class="title" href="'+v.url+'" target="_blank">'+v.title+'</a>';
		html += '<div class="info-wrap">';
		html += '<a class="thumb-wp" href="'+v.url+'" target="_blank">';
		html += '<img src="'+thumbnail+'" alt="" class="w100">';
		html += '</a>';
		html += '<div class="info-wp">';
		html += '<div class="authors">';
		html += '<span class="author">'+author+'</span>';
		if(v.translators.length) html += '<span class="translator"> (???: '+translator+')</span>';
		html += '</div>';
		html += '<div class="prices">';
		html += '<span class="price">'+numberFormat(v.price)+'</span> | ';
		html += '<span class="sale-price">'+salePrice+'</span>';
		if(v.status) html += '<span class="status"> ['+v.status+']</span>';
		html += '</div>';
		html += '<div class="publisher">'+v.publisher+'</div>';
		html += '<div class="isbn">'+isbn+'</div>';
		html += '<div class="dt">'+dt+'</div>';
		html += '</div>';
		html += '</div>';
		html += '<a class="content" href="'+v.url+'" target="_blank">'+v.contents+'</a>';
		html += '</li>';
		$('.lists').append(html);
	});
}

function setCafeLists(r) {
	$('.lists').empty().attr({'class': 'lists cafe', 'style': ''});
	var html = '';
	r.forEach(function(v, i) {
		html  = '<li class="list">';
		html += '<a class="thumbs" href="'+v.url+'" target="_blank">';
		html += '<img src="'+v.thumbnail+'" alt="'+v.title+'" class="w100">';
		html += '</a>';
		html += '<div class="contents">';
		html += '<a class="title" href="'+v.url+'" target="_blank">'+v.title+'</a>';
		html += '<p class="content">'+v.contents+'</p>';
		html += '<a class="name" href="'+v.url+'" target="_blank">'+v.cafename+'</a> | <a href="'+v.url+'" class="link" target="_blank">'+v.url+'</a>';
		html += '<div class="dt">'+moment(v.datetime).format('YYYY-MM-DD HH:mm:ss')+'</div>';
		html += '</div>';
		html += '</li>';
		$('.lists').append(html);
	});
}

function setPager(isEnd, totalRecord) {
	$('.pager-wrapper').show();
	if(observer)observer.unobserve();
	page = Number(page);
	var totalPage = Math.ceil(totalRecord/size[cate]); // ??? ????????????
	if(totalPage > 50) totalPage = 50;
	if(cate === 'vclip' && totalPage > 15) totalPage = 15;
	if(page > totalPage) page = totalPage;
	var pagerCnt = 5;			// pager??? ????????? ????????? ???
	var startPage;				// pager??? ?????? ??????
	var endPage;					// pager??? ????????? ??????
	startPage = Math.floor((page - 1) / pagerCnt) * pagerCnt + 1;
	endPage = startPage + pagerCnt - 1;
	if(endPage > totalPage) endPage = totalPage;
	
	console.log('data:', totalRecord, 'totalPage: ', totalPage, 'startPage: ', startPage, 'endPage: ', endPage, 'page: ', page);
	$('.pager-wrap .bt-page').remove(); // el??? ???????????? ???????????? ????????????.
	for(var i=startPage; i<=endPage; i++) {
		// $('.pager-wrap .bt-next').before('<a href="#" class="bt-page">'+i+'</a>');
		if(i === page) 
			$('<button class="bt-page active" data-page="'+i+'">'+i+'</button>').insertBefore('.pager-wrap .bt-next').click(onPagerClick);
		else
			$('<button class="bt-page" data-page="'+i+'">'+i+'</button>').insertBefore('.pager-wrap .bt-next').click(onPagerClick);
	}
	if(page === 1)
		$('.pager-wrap .bt-first').attr('disabled', true);
	else
		$('.pager-wrap .bt-first').attr('disabled', false);
	if(startPage === 1)
		$('.pager-wrap .bt-pager-prev').attr('disabled', true);
	else	
		$('.pager-wrap .bt-pager-prev').attr('disabled', false)[0].dataset['page'] = startPage - 1;
	if(page === 1)
		$('.pager-wrap .bt-prev').attr('disabled', true);
	else
		$('.pager-wrap .bt-prev').attr('disabled', false)[0].dataset['page'] = page - 1;
	if(page === totalPage)
		$('.pager-wrap .bt-next').attr('disabled', true);
	else
		$('.pager-wrap .bt-next').attr('disabled', false)[0].dataset['page'] = page + 1;
	if(endPage === totalPage)
		$('.pager-wrap .bt-pager-next').attr('disabled', true);
	else
		$('.pager-wrap .bt-pager-next').attr('disabled', false)[0].dataset['page'] = endPage + 1;
	if(page === totalPage)
		$('.pager-wrap .bt-last').attr('disabled', true);
	else
		$('.pager-wrap .bt-last').attr('disabled', false)[0].dataset['page'] = totalPage;
}

function setIntersection(){
	$('.pager-wrap').hide();
	observer = new IntersectionObserver(onIntersection, {});
	observer.observe(document.querySelector('.lists'));
}

/************** event callback ************/
function onIntersection(el) {

}





function onPagerClick() {
	page = Number(this.dataset['page']);
	axios.get(getPath(cate), getParams(query)).then(onSuccess).catch(onError);
}

function onLoadError(el) {
	$('.modal-wrapper .img-wp img').attr('src', $(el).data('thumb'));
}

function onModalShow() {
	var v = $(this).data('info');
	$('.modal-wrapper').show();
	$('.modal-wrapper .img-wp img').attr('src', v.src);
	$('.modal-wrapper .img-wp img').data('thumb', v.thumb);
	$('.modal-wrapper .size-wp').html(v.width + ' x ' + v.height);
	$('.modal-wrapper .collection').html('['+v.collection+'] ');
	$('.modal-wrapper .name').html(v.name);
	$('.modal-wrapper .link').attr('href', v.url).html(v.url);
	$('.modal-wrapper .dt').html(moment(v.datetime).format('YYYY-MM-DD HH:mm:ss'));
}

function onSubmit(e) {
	e.preventDefault();
	cate = $(this).find('select[name="category"]').val().trim();
	query = $(this).find('input[name="query"]').val().trim();
	if(cate && cate !== '' && query && query !== '')
		axios.get(getPath(cate), getParams(query)).then(onSuccess).catch(onError);
	else
		$(this).find('input[name="query"]').focus();
}

function onSuccess(res) {
	console.log(res);
	var cateStr = res.config.url.split('/').pop();
	var v = res.data;
	setTotalCnt(v.meta.pageable_count);
	if(cate === 'vclip' || cate === 'image')setIntersection(v.meta.is_end,v.meta.pageable);
	else setPager(v.meta.is_end, v.meta.pageable_count);
	switch(cateStr) {
		case 'web':
			setWebLists(v.documents);
			break;
		case 'image':
			setImageLists(v.documents);
			break;
		case 'vclip':
			setClipLists(v.documents);
			break;
		case 'blog':
			setBlogLists(v.documents);
			break;
		case 'book':
			setBookLists(v.documents);
			break;
		case 'cafe':
			setCafeLists(v.documents);
			break;
	}
	
}

function onError(err) {
	console.log(err);
}


/*************** event init ***************/
$('.search-form').submit(onSubmit);
$('.pager-wrap .bt-first').click(onPagerClick);
$('.pager-wrap .bt-pager-prev').click(onPagerClick);
$('.pager-wrap .bt-prev').click(onPagerClick);
$('.pager-wrap .bt-next').click(onPagerClick);
$('.pager-wrap .bt-pager-next').click(onPagerClick);
$('.pager-wrap .bt-last').click(onPagerClick);


/*************** start init ***************/