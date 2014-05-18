
$(function () {
	var LOAD_ALL_AVATAR = false;

	if (window.location.pathname.indexOf('/activity/id')+1) {
		$.ajax({
			method: 'POST',
			url: '/posts/get',
			data: {
				attached: 'activity',
				attached_id: $('.send-comment').attr('id')
			},
			success: function (res) {
				var monthsName = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
				if (res.msg=='success') {
					html = '';
					for (var i = 0; i<res.posts.length; i++) {
						cr = new Date(res.posts[i].created);

						hours = (cr.getHours()<10?('0'+cr.getHours()):cr.getHours());
						mins = (cr.getMinutes()<10?('0'+cr.getMinutes()):cr.getMinutes());
						secs = (cr.getSeconds()<10?('0'+cr.getSeconds()):cr.getSeconds());
						time = hours + ':' + mins + ':' + secs;

						date = cr.getDate() + " " + monthsName[cr.getMonth()] + " " + cr.getFullYear();

						html += "<div class='one-comment'>" +
									"<div class='comment-created-date'>" +
										date + ", " + time + 
									"</div>" +
									"<div class='comment-content'>" +
										res.posts[i].content + 
									"</div>" + 
									"<div class='comment-avatar'>" +
										"<img src='"+res.users[i].photo+"'>" + 
										"<div class='comment-author'>" +
											res.users[i].name + " " + res.users[i].family +
										"</div>" + 
									"</div>" + 
								"</div>";
					}
					$('.for-add-comment').after(html);
				}
			},
			error: function (err) {
				alert('ERROR: ' + err);
			}
		})
	}

	// $('.print-before-load-page').each( function () {
	// 	var el = $(this);
	// 	if ($(this).attr('id')) {
	// 		$.ajax({
	// 			method: 'POST',
	// 			url: '/activity/getuser',
	// 			data: {
	// 				id: $(this).attr('id')
	// 			},
	// 			success: function (res) {
	// 				if (res.user) {
	// 					el.closest('a').attr('title', res.user.name+' '+res.user.family);
	// 					el.css('background-image', 'url("'+res.user.photo+'")');
	// 					el.children('div').html(res.user.name);
	// 				}
	// 				if (res.err) {
	// 					alert(res.err);
	// 				}
	// 			},
	// 			error: function (err) {
	// 				alert(err);
	// 			}
	// 		});
	// 	}
	// });

	function print_first_nine () {
		var usersa = [];
		var windowsa = $('[uid]');
			for (var i=0; i<windowsa.length; i++) {
				usersa[i] = (windowsa[i].getAttribute('uid'));
			}
			$.ajax({
				method: 'POST',
				url: '/search/resOfSearch',
				data: {
					users: usersa,
					pagecount: 'max'
				},
				success: function (res) {
					if (res[0]) {
						
						res.forEach( function (user) {
							$('[uid='+user._id+']').closest('a').attr('title', user.name+' '+user.family);
							$('[uid='+user._id+']').css('background-image', 'url("'+user.photo+'")');
							$('[uid='+user._id+']').children('div').html(user.name);
						})
					}
				},
				error: function (err) {
					alert(err);
				}
			});
		}
	print_first_nine();

	$('.close-look-all-member').click( function () {
		$('.look-all-member').fadeOut();

	});

	$('.member-counts').click( function () {
		$('.look-all-member').fadeIn();
		if (!LOAD_ALL_AVATAR) {
			var users = [];
			var windows = $('.look-window');
			for (var i=0; i<windows.length; i++) {
				users.push(windows[i].getAttribute('id'));
			}
			$.ajax({
				method: 'POST',
				url: '/search/resOfSearch',
				data: {
					users: users,
					pagecount: 'max'
				},
				success: function (res) {
					if (res) {
						
						res.forEach( function (user) {
							$('.look-window#'+user._id).closest('a').attr('title', user.name+' '+user.family);
							$('.look-window#'+user._id).css('background-image', 'url("'+user.photo+'")');
							$('.look-window#'+user._id).children('div').html(user.name+'\n'+user.family);
						})
						LOAD_ALL_AVATAR = true;
					}
				},
				error: function (err) {
					alert(err);
				}
			});
		}
	})

	$('.slide-right-look-all-member').click( function () {
		$('.place-for-all-member').animate({ scrollLeft: '+=250' }, 400);
	})
	$('.slide-left-look-all-member').click( function () {
		$('.place-for-all-member').animate({ scrollLeft: '-=250' }, 400);
	})

	$('body').on('click', '.let-include-me', function () {
		el = $('.let-include-me');
		el.html('Секундочку...');
		$.ajax({
			method: "POST",
			url: "/activity/include_member",
			data: {
				activity: window.location.pathname
			},
			success: function (res) {
				if (res.msg=='success') {
					el.html('Отлично!');
					setTimeout( function () {
						el.html('Не учавствовать');
						el.removeClass('let-include-me');
						el.addClass('let-outclude-me');
					}, 700);
				} else {
					el.html('Ошибка');
					setTimeout( function () {
						el.html('Попробовать еще раз');
					}, 700);					
				}
			},
			error: function (err) {
				el.html('Ошибка');
				setTimeout( function () {
					el.html('Попробовать еще раз');
				}, 700);
			}
		})
	})
	$('body').on('click', '.let-outclude-me', function () {
		el = $('.let-outclude-me');
		el.html('Секундочку...');
		$.ajax({
			method: "POST",
			url: "/activity/outclude_member",
			data: {
				activity: window.location.pathname
			},
			success: function (res) {
				if (res.msg=='success') {
					el.html('Выполнено');
					setTimeout( function () {
						el.html('Учавствовать');
						el.removeClass('let-outclude-me');
						el.addClass('let-include-me');
					}, 700);
				} else {
					el.html('Ошибка');
					setTimeout( function () {
						el.html('Попробовать еще раз');
					}, 700);					
				}
			},
			error: function (err) {
				el.html('Ошибка');
				setTimeout( function () {
					el.html('Попробовать еще раз');
				}, 700);
			}
		})
	})

	$('.send-comment').click(function () {
		id = $(this).attr('id');
		author = $(this).attr('author');
		$.ajax({
			method: 'POST',
			url: '/posts/create',
			data: {
				attached: 'activity',
				attached_id: id,
				content: $(".input-comment-body").val(),
				author: author
			},
			success: function (res) {
				$(".input-comment-body").val('');
				if (res.msg == 'success') {
					$.ajax({
						method: "POST",
						url: '/activity/getuser',
						data: {
							id: res.post.author
						},
						success: function (rest) {
							var monthsName = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
							cr = new Date();

							hours = (cr.getHours()<10?('0'+cr.getHours()):cr.getHours());
							mins = (cr.getMinutes()<10?('0'+cr.getMinutes()):cr.getMinutes());
							secs = (cr.getSeconds()<10?('0'+cr.getSeconds()):cr.getSeconds());
							time = hours + ':' + mins + ':' + secs;

							date = cr.getDate() + " " + monthsName[cr.getMonth()] + " " + cr.getFullYear();

							html = 		"<div class='one-comment'>" +
											"<div class='comment-created-date'>" +
												date + ", " + time + 
											"</div>" +
											"<div class='comment-content'>" +
												res.post.content + 
											"</div>" + 
											"<div class='comment-avatar'>" + 
												"<img src='"+rest.user.photo+"'>" + 
												"<div class='comment-author'>" +
													rest.user.name + " " + rest.user.family +
												"</div>" +
											"</div>" +
										"</div>";
							$('.for-add-comment').after(html);
						},
						error: function (err) {

						}
					})
				}
			},
			error: function (err) {
				alert(err);
			}
		})
	});
});