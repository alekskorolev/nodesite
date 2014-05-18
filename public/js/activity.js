$(function () {

	// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ДЛЯ ХРАНЕНИЯ ЗНАЧЕНИЯ ТЕКУЩЕГО МЕСЯЦА
		var url = window.location.href;
		var year, month;
			url = url.split('?');
			if (url[1]&&url[1].length>0) {
				url = url[1].split('&');
				year = url[0].split('=')[1];
				month = url[1].split('=')[1];
			}
		var THIS_MONTH = new Date();
		var THIS_YEAR  = year? parseInt(year) : THIS_MONTH.getFullYear();
			THIS_MONTH = month? parseInt(month) : THIS_MONTH.getMonth();

	// Массив пользователей, которых можно пригласить для участия в мероприятиях
		var USERS = Array;

	// ГЛОБАЛЬНЫЙ МАССИВ, КОТОРЫЙ ХРАНИТ ДАННЫЕ О СОБЫТИЯХ НА РАЗНЫЕ МЕСЯЦЫ
		var ACTIVITIES = Array;

	function one_height() {
		height_left = $(".create-activity-left-panel").innerHeight();
		height_right = $(".create-activity-right-panel").innerHeight();

		$('.create-activity-left-panel').innerHeight(height_right>height_left? height_right : height_left);
	};

	function get_and_print_activities(start, finish) {
		$('.event-days-list').css('opacity', 0.4);
		$('body').css('cursor', 'progress');

		if (!start) {
			start = new Date();
		}
		// Запрашиваем мероприятия на этот период из баззы данных.
		$.ajax({
			url: '/activity/getactsday',
			method: 'POST',
			data: {
				type: 'concret',
				year: start.getFullYear(),
				month: start.getMonth(),
				day: finish? start.getDate(): null,
				finyear: finish? finish.getFullYear(): null,
				finmonth: finish? finish.getMonth(): null,
				finday: finish? finish.getDate(): null
			},
			success: function (res) {
				if (res.length>0) {
					// Очищаем место у мероприятий
					$('.event-days-list').html('');

	 				var indexDay = -1;
	 				var days = [];
	 				var day = '';
	 				for ( var i = 0; i < res.length; i++ ) {
	 					res[i].start = new Date(res[i].start);
	 					if ( (res[i].start.getFullYear() + '.' + res[i].start.getMonth() + '.' + res[i].start.getDate()) !== day) {
	 						indexDay++;
	 						days[indexDay] = {
	 							name: res[i].start,
	 							acts: []
	 						}
	 						day = res[i].start.getFullYear() + '.' + res[i].start.getMonth() + '.' + res[i].start.getDate();
	 					}
	 					days[indexDay].acts.push(res[i]);
	 				}

	 				// Теперь надо это все аккуратно вывести на страницу.
	 				var nameOfMonth = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'авгута', 'сентября', 'октября', 'ноября', 'декабря'];
				    var shortNameOfMonth = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
	 				var fullhtml = "";
	 				for ( var i = 0 ; i < days.length ; i++ ) {
	 					var tday = days[i];
	 					var headhtml = "<div class='this-day'>" + 
				 			"<div class='head-of-day'>" + 
				 				"<div class='title-of-day'>" +
				 					"Мероприятия "+ tday.name.getDate() + " " + nameOfMonth[tday.name.getMonth()] +
				 				"</div>" +
				 				"<div class='around-name-of-day'>" + 
				 					"<div class='name-of-day'>" + 
				 						tday.name.getDate() +" "+ shortNameOfMonth[tday.name.getMonth()] +
				 					"</div>" + 
				 				"</div>" +
				 				"<div class='open-all-activity'>" + 
				 					((tday.acts.length>1)? "<a>Посмотреть все</a>" : "") +
				 				"</div>" + 
				 			"</div>" +
				 			"<div class='place-for-all-activity'>";

				 		var contenthtml = '';
				 		for ( var j = 0 ; j < tday.acts.length ; j++ ) {
				 			var tact = days[i].acts[j];
				 			tact.created = new Date(tact.created);
				 			contenthtml += "<div class='this-activity'>" +
				 				"<a href='/activity/id/" + tact._id + "'>" +
		 						"<div class='activity-avatar'>" + 
		 							(tact.photoface?('<img src="'+tact.photoface+'" style=width:100px;height:100px>'):('')) + 							
		 						"</div>" + 
		 						"</a>" + 
		 						"<div class='activity-info'>" + 
		 							"<div class='act-name'>" +
		 								tact.name + 
		 							"</div>" + 
		 							"<div class='act-date'>" +
		 								"Добавлена" + tact.created.getDate()+" "+nameOfMonth[tact.created.getMonth()] + 
		 									" "+(tact.created.getHours()<10 ? '0' + tact.created.getHours() : tact.created.getHours() )+":"+(tact.created.getMinutes()<10? '0' + tact.created.getMinutes() : tact.created.getMinutes() ) +
		 								"</div>" + 
		 								"<div class='act-time'>" +
		 									(tact.timestart ? tact.timestart : 'Время не указано') + 
		 								"</div>" + 
		 								"<div class='act-place'>" + 
		 									tact.place +
		 								"</div>" + 
		 								"<div class='act-textinfo'>" +
		 									tact.description.substring(0,200) + "..." +
		 								"</div>" +
		 							"</div>" +
		 						"</div>";
				 		}


				 		var footerhtml = "</div></div>";
				 		fullhtml += headhtml + contenthtml + footerhtml;
	 				}
	 				$('.event-days-list').html(fullhtml);
	 				$('.event-days-list').animate({opacity: 1}, 400);
	 				$('body').css('cursor', 'auto');
				} else {
					$('.event-days-list').html("<div class='none-acts'>На этот месяц мероприятий не запланировано.</div>");
					$('.event-days-list').animate({opacity: 1}, 400);
					$('body').css('cursor', 'auto');
				}
			},
			error: function (xhr) {
				alert(xhr);
			}
		})
	}
	//get_and_print_activities();

	function print_ME_calendar (type) {
		// if (!first) { first = 'calendar-back' }
		// if (!second) { second = 'calendar' }
		// if (!third) { third = 'calendar-next' }
		$(".calendar, .calendar-next, .calendar-back").html(" ");

		MEcalendar(".calendar", {
			small: false,
			month: THIS_MONTH,
			year: THIS_YEAR,
			acts: null,
			type: type
		});

		MEcalendar(".calendar-next", {
			small: true,
			month: THIS_MONTH+1,
			year: THIS_YEAR,
			acts: null,
			type: type
		});

		MEcalendar(".calendar-back", {
			small: true,
			month: THIS_MONTH-1,
			year: THIS_YEAR,
			acts: null,
			type: type
		});

		if (ACTIVITIES[THIS_YEAR+'#'+THIS_MONTH]) {
			MEcalendar(".calendar", {
				small: false,
				month: THIS_MONTH,
				year: THIS_YEAR,
				acts: ACTIVITIES[THIS_YEAR+'#'+THIS_MONTH],
				type: type
			});	
		} else {
			$.ajax({
				url: '/activity/getactsday',
				method: 'POST',
				data: {
					type: 'count',
					year: THIS_YEAR,
					month: THIS_MONTH
				},
				success: function (res) {
					if (res) {
						ACTIVITIES[THIS_YEAR+'#'+THIS_MONTH] = res;
						MEcalendar(".calendar", {
							small: false,
							month: THIS_MONTH,
							year: THIS_YEAR,
							acts: res,
							type: type
						});
					}
				},
				error: function (err) {

				}
			});
		}
		if (ACTIVITIES[THIS_YEAR+'#'+(THIS_MONTH+1)]) {
			MEcalendar(".calendar-next", {
				small: true,
				month: THIS_MONTH+1,
				year: THIS_YEAR,
				acts: ACTIVITIES[THIS_YEAR+'#'+(THIS_MONTH+1)],
				type: type
			});	
		} else {
			$.ajax({
				url: '/activity/getactsday',
				method: 'POST',
				data: {
					type: 'count',
					year: THIS_YEAR,
					month: THIS_MONTH+1
				},
				success: function (res) {
					if (res) {
						ACTIVITIES[THIS_YEAR+'#'+(THIS_MONTH+1)] = res;
						MEcalendar(".calendar-next", {
							small: true,
							month: THIS_MONTH+1,
							year: THIS_YEAR,
							acts: res,
							type: type
						});
					}
				},
				error: function (err) {

				}
			});
		}
		if (ACTIVITIES[THIS_YEAR+'#'+(THIS_MONTH-1)]) {
			MEcalendar(".calendar-back", {
				small: true,
				month: THIS_MONTH-1,
				year: THIS_YEAR,
				acts: ACTIVITIES[THIS_YEAR+'#'+(THIS_MONTH-1)],
				type: type
			});	
		} else {
			$.ajax({
				url: '/activity/getactsday',
				method: 'POST',
				data: {
					year: THIS_YEAR,
					month: THIS_MONTH-1,
					type: 'count'
				},
				success: function (res) {
					if (res) {
						ACTIVITIES[THIS_YEAR+'#'+(THIS_MONTH-1)] = res;
						MEcalendar(".calendar-back", {
							small: true,
							month: THIS_MONTH-1,
							year: THIS_YEAR,
							acts: res,
							type: type
						});
					}
				},
				error: function (err) {

				}
			});
		}

	}
	// Если мы находимся в Разделе "activity", то рисуем календари
	var url = window.location.href;

	if (url.indexOf("activity")+1&&!(url.indexOf('new')+1)&&!(url.indexOf('activity/id')+1)) print_ME_calendar();


	//При нажатии на "Посмотреть все"
	$("body").on("click", ".open-all-activity a", function () {
		var thisDay = $(this).closest(".this-day").find(".place-for-all-activity");
		thisDay.toggleClass("open");
	});

	// Свернуть
	$(".panel-for-close-this-day div").click( function () {
		var thisDay = $(this).closest(".this-day").find(".place-for-all-activity");
		thisDay.toggleClass("open");
	});

	$(".to-left").click( function () {
		THIS_MONTH--;
		if (THIS_MONTH<0) { THIS_MONTH=11; THIS_YEAR--; }
		//alert(THIS_MONTH + " " + THIS_YEAR);
		print_ME_calendar();
		var start = new Date(THIS_YEAR, THIS_MONTH, 1);
		get_and_print_activities(start);
	});

	$(".to-right").click( function () {
		THIS_MONTH++;
		if (THIS_MONTH>11) { THIS_MONTH=0; THIS_YEAR++; }
		//alert(THIS_MONTH + " " + THIS_YEAR);
		print_ME_calendar();
		var start = new Date(THIS_YEAR, THIS_MONTH, 1);
		get_and_print_activities(start);
	});

	$('body').on('click', 'span.links', function () {
		if ( (window.location.href.indexOf('/activity')+1)&&!(window.location.href.indexOf('new')+1) ) {
			year = parseInt($(this).attr('year'));
			month = parseInt($(this).attr('month'));
			day = parseInt($(this).attr('day'));
			var start = new Date(year, month, day);
			var finish = new Date(year, month, day+1);
				// finish = finish - 1;
				// finish = new Date(finish);

			THIS_MONTH = month;
			THIS_YEAR = year;
			print_ME_calendar();
			get_and_print_activities(start, finish);
		}
	})

	one_height();

	/* Создание мероприятий */
	$('.button-for-load-photo').click( function () {
		$('.input-for-load-face-activities').trigger('click');
	})
	$('.place-for-photo-icon').click( function () {
		$('.load-photoalbum-for-activity').trigger('click');
	})
	$('.place-for-video-icon').click( function () {
		$('.load-videoalbum-for-activity').trigger('click');
	})
	$('.check-activities-date-button').click( function () {
		print_ME_calendar('check-date');
		$('.check-date-for-activity').show();
	})
	$('.close-check-date, .button-check-date-cancel').click( function () {
		$('.check-date-for-activity').hide();
	});

	$('.to-right-check-date').click( function () {
		THIS_MONTH++;
		if (THIS_MONTH>11) { THIS_MONTH=0; THIS_YEAR++; }
		//alert(THIS_MONTH + " " + THIS_YEAR);
		print_ME_calendar('check-date');
	});
	$('.to-left-check-date').click( function () {
		THIS_MONTH--;
		if (THIS_MONTH<0) { THIS_MONTH=11; THIS_YEAR--; }
		//alert(THIS_MONTH + " " + THIS_YEAR);
		print_ME_calendar('check-date');
	})
	$('body').on('click', '.dopinfo', function () {
		$('.dopinfo').removeClass('date-checkin')
		$(this).addClass('date-checkin');

		$('.checked-date').html('Мероприятие состоится: <span class="input-check-date">' + 
			($(this).html()<10?'0':'')+$(this).html() + '.' + 
			( (parseInt($(this).attr('month'))+1)<10?'0':'')+( parseInt($(this).attr('month'))+1) + '.' +  
			$(this).attr('year') );
		$('input[name=start]').val(($(this).html()<10?'0':'')+$(this).html() + '.' + 
			( (parseInt($(this).attr('month'))+1)<10?'0':'')+( parseInt($(this).attr('month'))+1) + '.' +  
			$(this).attr('year'))
	});

	$('.create-activity-button').click( function () {
		$('#form-for-create-activity').ajaxSubmit({
			success: function (res) {
				if (res._id) {
					window.location.href = ('/activity/id/'+(''+res._id));
				}
			},
			error: function (err) {

			}
		});
		return false;
	})

	$('.button-check-date-submit').click( function () {
		$('.check-date-for-activity').hide();
	})
	/*создать альбом*/
	function open_popup(box) { 
		$(".blackout").show() 
		box.centered_popup(); 
		box.delay(100).show(0);
	};
	function close_popup(box) { 
		box.hide(); 
		$(".blackout").delay(100).hide(1); 
	};

	$('.input-for-load-face-activities').change( function () {
		$('#uploadActFace').ajaxSubmit({
			success: function (res) {
				var cropData;
	            open_popup($('.popup-actface-editor'));
	            var editor = $('#editor-actface');
	            	editor.attr('src', res);
	            	editor.Jcrop({
	            		aspectRatio: 290/291,
	            		onSelect: function (area) {
	            			cropData = area;
	            		}
	            	});

	            	$('.btn_save_photo').click(function () {
	            		var f = editor[0].naturalHeight / 345;
	            		if (cropData) {
		            		$.post('/activity/cropFace', {
		            			w:cropData.w*f,
		            			h:cropData.h*f,
		            			x:cropData.x*f,
		            			y:cropData.y*f,
		            			x2:cropData.x2*f,
		            			y2:cropData.y2*f
		            		},
		            			function (response) {
		            				$('.photo-face-for-activities').remove();
		            				$('.button-for-load-photo').before('<img src='+response.path+' class="photo-face-for-activities">');
		            				close_popup($('.popup-actface-editor'));
		            				$('.button-for-load-photo').hide();
		               		});
		               	} else {
		               		$(".autorisation").attr("style", "color: maroon");
		               		$(".autorisation").text("Необходимо выделить фрагмент изображения!");
		               	}
	            		return false;
	            	})
			},
			error: function (err) {
				alert('neok');
			},
			uploadProgress: function (ev, pos, total, percent) {
				$('.button-for-load-photo').html('Загрузка, ' + percent + '%');
			}
		});
	})

	$(".invite-new-members-into-activity").click( function () {
		if (!USERS[0]) {
			$.ajax({
				method: "POST",
				url: "/activity/getusers",
				success: function (res) {
					USERS = res;
					fullhtml = '';

					var ind = 1;
					res.forEach( function (user) {
						rating = [];
						for (var i = 0; i<5; i++ ) {
							if (i<user.rating) {
								rating[i] = '<img src="/img/mini-star.png" class="mini-star-in-memb">';
							} else {
								rating[i] = '<img src="/img/mini-star2.png" class="mini-star-in-memb">';
							}
						}
						rating = rating.join('');
						html = [
							"<div class='one-user-in-check-memb'>",
			 					"<div class='member-rating'>",
			 						rating,
			 					"</div>",
			 					"<div class='member-avatar'>",
			 						"<img src='"+user.photo+"'>",
			 					"</div>",
			 					"<div class='member-name'>",
			 						(user.name?(user.name):'<font style="visibility:hidden">noname</font>'),
			 					"</div>",
			 					"<div class='member-family'>",
			 						(user.family?(user.family):'<font style="visibility:hidden">nofam</font>'),
			 					"</div>",
			 					"<div class='member-input-check'>",
			 						"<img src='/img/checked-member.png' class='img-for-member-checked'>",
			 					"</div>",
			 					"<input type='checkbox' name='members' value='"+user._id+"'>",
			 				"</div>"
						];
						// fullhtml += html.join('');
						$(".label-for-line"+ind).before(html.join(''));
						ind++;
						if (ind>3) ind=1;			
					})
					$(".check-members").show();
				},
				error: function (err) {
					alert(err);
				}
			});
		} else {
			$(".check-members").show();
		}
	})
	$('.close-check-memb').click( function () {
		$('.check-members').hide();
	})

	$('body').on('click','.one-user-in-check-memb', function () {
		input = $(this).find('input');

		if (input.attr('checked')=='checked') {
			input.removeAttr('checked');
			$(this).find('.img-for-member-checked').hide();
		} else {
			$(this).find('.img-for-member-checked').show();
			$(this).find('input').attr('checked', 'true');
		}
	});

	$('.check-all-members').click(function () {
		$('.img-for-member-checked').show();
		$('.one-user-in-check-memb input').attr('checked', 'true');	
	});
	$('.get-invite-members').click( function () {
		$('.check-members').hide();
	})

	$('.load-photoalbum-for-activity').change( function () {
		$('.info-about-uploadPhoto-progress').show();
		$('#uploadPhotoInAct').ajaxSubmit({
			success: function (res) {
				if (res.photo) {
					$('.label-for-place-loaded-photo').before('<img src="'+res.photo.prevPath+'" class="succ-loaded-photo">');
					one_height();
					$('.info-about-uploadPhoto-progress').hide();
				}
			},
			error: function (err) {
				alert(err);
			},
			uploadProgress: function (ev, pos, total, percent) {
				$('.info-about-uploadPhoto-progress').html('Загрузка: '+percent+'%');
			}
		})

		return false;
	});

	$('.load-videoalbum-for-activity').change( function () {
		$('.info-about-uploadVideo-progress').show();
		$('#uploadVideoInAct').ajaxSubmit({
			success: function (res) {
				if (res.video) {
					$('.label-for-place-loaded-video').before('<img src="'+res.video.videoprev+'" class="succ-loaded-photo">');
					one_height();
					$('.info-about-uploadVideo-progress').hide();
				}
			},
			error: function (err) {
				alert(err);
			},
			uploadProgress: function (ev, pos, total, percent) {
				$('.info-about-uploadVideo-progress').html('Загрузка: '+percent+'%');
			}
		})

		return false;
	});

	$(".scroll-to-right-members").click( function () {
		$('.place-for-users-avatar').animate({ scrollLeft: '+=450' }, 400);
	})
	$(".scroll-to-left-members").click( function () {
		$('.place-for-users-avatar').animate({ scrollLeft: '-=450' }, 400);
	})

	$('.show-create-comment-form').click( function () {
		$('.form-for-create-comment').show();
		$(this).hide();
		$('.send-comment').show();
	})

	$('.send-comment').click( function () {
		$(this).hide();
		$('.form-for-create-comment').hide();
		$('.show-create-comment-form').show();
	});
})