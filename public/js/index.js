$.fn.lgCarousel = function (options) {
	options || (options = {});
	var $this = this;
	var $slider = this.find(options.sliderBox || 'ul');
	var $arrow = this.find(options.sliderArrow || '.lg-arrow');
	var nextCls = options.nextCls || 'lg-next';
	var prevCls = options.prevCls || 'lg-prev';
	var time = options.time || 2000;
	var rotateBy = 1;
	var speed = 500;

	var running = false;

	var els = $slider.children();

	var itemWidth = els.outerWidth(true);
	var itemsTotal = els.length;

	function slide(dir) {
		var direction = !dir ? -1 : 1;
		var leftIndent = 0;
		
		if (!running) {
			running = true;
			
			if (!dir) {
				$slider.children().last().after($slider.children().slice(0, rotateBy).clone(true));
			} else {
				$slider.children().first().before($slider.children().slice(itemsTotal - rotateBy, itemsTotal).clone(true));
				$slider.css('left', -itemWidth * rotateBy + 'px');
			}
			leftIndent = parseInt($slider.css('left')) + (itemWidth * rotateBy * direction);
			$slider.animate({'left': leftIndent}, {queue: false, duration: speed, complete: function() {
				if (!dir) { 
					$slider.children().slice(0, rotateBy).remove();         
					$slider.css('left', 0);
				} else { 
					$slider.children().slice(itemsTotal, itemsTotal + rotateBy).remove();
				}       
				running = false;
			}});
		}
		
		return false;
	}

	$arrow.click(function () {
		($(this).hasClass(nextCls)) ? slide(false) : slide(true);
	});

	return this;
}
$(function(){
	$(document).ready(function() {
        projekktor('video', {
	                /* path to the MP4 Flash-player fallback component */
	                playerFlashMP4:		'/img/StrobeMediaPlayback.swf',
	        
	                /* path to the MP3 Flash-player fallback component */
	                playerFlashMP3:		'/img/StrobeMediaPlayback.swf'         
               });
    });
	$(".search-cancel").click( function () {
		$(".prof-spec").html("Профессиональная область");
		$(".gender-setting").html("Выберите пол");
	});
	$('.logmenu_btn_disable').click(function(){
		//Проверка rest маршрута
		$.ajax({
		  	url: "/rest/invite",
		  	success: function(data){
		    	alert( "Прибыли данные: " + data );
		  	}
		});
	});
	$('.logo-menu_logo').click(function(){
		window.location.href='/';
	});
	$('.invite_btn').click(function(){
		//TODO: Реализовать валидацию данных на стороне клиента
		window.location.href='/invite';
	});
	$('.invite_submit').click(function(){
		$( "#invite_form" ).submit();
	});
	$('.btn_log').click(function (event) {
		$.post( "/rest/login", $( "#enter-form" ).serialize())
		  	.done(function( data ) {
		    	if (data=='authorized') {
		    		window.location.href='/';
			    } else {
			    	$('.error_line.error_loginpas').fadeIn(50).delay(700).fadeOut(500);
			    }
		  	});
		return false;
	});

	$('.pass_help').click(function (event) {
		$(this).removeClass('pass_help');
		$(this).addClass('empass_changing');
		$(this).html('Отправляем письмо!');
		var login = $( "#enter-form #login" ).val();
		console.log(login);
		if (login=="") {
			$('.error_line.required_login').fadeIn(50).delay(700).fadeOut(500);
		} else {
			$.post( "/rest/restorepass", { login: login })
				.done(function ( response ) {
					if (response=='ok') {
			    		$('.empass_changing').html('Письмо отправлено!');
				    } else {
				    	$('.error_line.error_login').fadeIn(50).delay(700).fadeOut(500);
				    }
				})
		}
		return false;
	});
	$('.invSend').click(function (event) {
		$(this).attr('disabled', true);
		$.post( "/rest/invsend", {id: event.target.id})
		  .done(function( data ) {
		  	alert( "Результат отправки: " + data );
		  	$('.invSend').removeAttr('disabled');
		  });
		  return false;
	});

	$.fn.centered_popup = function() { 
	    this.css('position', 'absolute'); 
	    this.css('left', ($(window).width() - this.width()) / 2 + $(window).scrollLeft() + 'px'); 
 	} 

	function open_popup(box) { 
	  $(".blackout").fadeIn(300); 
	  box.centered_popup(); 
	  box.fadeIn(300); 
	} 
	$('.slide-avatar').lgCarousel({
		sliderBox: '.avatar_carusel',
		nextCls: 'btn_right',
		prevCls: 'btn_left',
	});
	function close_popup(box) {
		  $('#hide-layout,.popup-login  input').val('') 
	  box.fadeOut(300);
	  $(".blackout").fadeOut(300);
	} 	
	$("#login_click").click(function(){
		closeAll();
		open_popup($('.popup-login'));
	})
	$('#logout_click').click(function(){
		$.post( "/rest/logout")
		  .done(function( data ) {
		    if (data=='exit') {
		    	window.location.href='/';
		    }
		  });
	})
	$('.btn-close').click(function() {
		close_popup($('.popup-login,.popup-empass-changed,.popup-error-empass,.noCropData'));
	})
	$('.cancelPhotoEdit').click(function() {
		close_popup($('.popup-photo-editor'));
		window.location.reload(true);
	})

 /*выдвигающееся меню*/
	$('.button_pushmenu,.logmenu_btn-home,.menu_btn').click(function () {
		var opened = $(this).hasClass('open');
		var menu = $('.push-container');
		if(opened){
			$(this).removeClass('open');
			menu.removeClass('open');
		}else{
			closeAll();
			$(this).addClass('open');
			menu.addClass('open');
		}
		//(menu.hasClass('hide')) ? menu.removeClass('hide') : menu.addClass('hide');
	});
	$('.button-close').click(function(){
		$('.button_pushmenu, .logmenu_btn-home,.menu_btn').removeClass('open');
		$('.push-container').removeClass('open');
	})
	$('.edit-inform').on('mouseup',function () {
		var dropText = $(this).children('.name-inform');			
		var dropList = $(this).children('.title');
		var chack = dropList.children('input')
		if(dropList.hasClass('hide')) dropList.removeClass('hide'); else return false;
		dropList.children('input').on('change', function (e) {
			var arr = [];
			chack.each(function(key,el){
				if($(el).is(':checked')) arr.push($(el).next().text())
			})
			dropText.text(arr.join(', '));
		});
		$(window).on('mousedown',function (e) {				
			if($(e.target).closest('.title').length){						
				return false;
			}
			$(window).off('mousedown');
			dropList.addClass('hide')
			
		});
	});
			
	$('.edit-inform-reg').on('mouseup',function () {
		var dropText = $(this).children('.name-inform-reg');			
		var dropList = $(this).children('.title-reg');
		var chack = dropList.children('input')
		if(dropList.hasClass('hide')) dropList.removeClass('hide'); else return false;
		dropList.children('input').on('change', function (e) {
			var arr = [];
			chack.each(function(key,el){
				if($(el).is(':checked')) arr.push($(el).next().text())
			})
			dropText.text(arr.join(', '));
		});
		$(window).on('mousedown',function (e) {	
			if($(e.target).closest('.title-reg').length){						
				return false;
			}
			$(window).off('mousedown');
			dropList.addClass('hide')	
		});
	});

/*выдвигающееся меню*/
	$('.mail').click(function () {		
		var opened = $(this).hasClass('open');
		var menu = $('.back-container');
		if(opened){
			$(this).removeClass('open');
			menu.removeClass('open');
		}else{
			closeAll();
			$(this).addClass('open');
			menu.addClass('open');
			$('#feedbackName').css('border-color','');
			$('#feedbackMail').css('border-color','');
			$('#feedbackMsg').css('border-color','');
		}
	});
	$('.fiedback-close').click(function(){
		$('.mail').removeClass('open');
		$('.back-container').removeClass('open');
		$('#feedback  .my_info, #feedback  .my_mesage').val('');
		$('#feedbackName').css('border-color','');
		$('#feedbackMail').css('border-color','');
		$('#feedbackMsg').css('border-color','');
	})
	$('.fiedback-ok').click(function (event) {
		var valid = true;
		var mailRegexp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (!$('#feedbackName').val()) {
			$('#feedbackName').css('border-color','red');
			valid = false;
		} else {
			$('#feedbackName').css('border-color','');
		}
		if (!$('#feedbackMail').val() || !mailRegexp.test($('#feedbackMail').val())) {
			$('#feedbackMail').css('border-color','red');
			valid = false;
		}else {
			$('#feedbackMail').css('border-color','');
		}
		if (!$('#feedbackMsg').val()) {
			$('#feedbackMsg').css('border-color','red');
			valid = false;
		}else {
			$('#feedbackMsg').css('border-color','');
		}
		var postData = $( "#feedback" ).serialize();
		if (valid) {
			$.post( "/rest/feedback", postData)
			.done(function( data ) {
				  //TODO реализовать вывод сообщений об ошибке или отравке
			    if (data.empty) {
		    		$('.back-after').fadeIn(200,function () {
			    		$('#feedback  .my_info, #feedback  .my_mesage').val('');		    			
		    		}).delay(1500).fadeOut(200,function(){
			    		$('.mail').removeClass('open');
			    		$('.back-container').removeClass('open');		    			
		    		})
			    } else {
		    		$('.mail').removeClass('open');
		    		$('.back-container').removeClass('open');
	
		  		  $('#feedback  .my_info, #feedback  .my_mesage').val('')
		    }
			  });
		} 
		  return false;
	});

 /*Загрузка видео в инвайт*/
 	$('.upload-button').click(function(){
    
    	$('.submit-upload').trigger('click');

	});
 	$('.submit-upload').change(function () {
 		var checkFile = {
 				type: /^video\/.+$/,
 				size: 1048576000,
 				name: /^.+\.(mp4)$/
 		}
 		var fi = $('.submit-upload');
 		var file = fi[0].files[0];
 		if (checkFile.type.test(file.type) && checkFile.name.test(file.name) && checkFile.size > file.size) {
 			$('.error-File').removeClass('error-true').addClass('error-false').html('');
 			$('.movieOk').val("true");
 		} else {
 			
 			$('.submit-upload').remove();
 			$('.upload-button').after($('<input type="file" class="submit-upload" name="file" id="file" accept="video/*">'));
 			$('.error-File').removeClass('error-false').addClass('error-true').html('Некоректный файл');
 			$('.movieOk').val("false");
  		}
   	});
   	$('#invite_form').on('change', '.urltime',  function(evt){
   		updateurl($(evt.currentTarget), $(evt.currentTarget).next(), $(evt.currentTarget).next().next());
   	});
   	$('#invite_form').on('change', '.urlurl', function(evt){
   		updateurl($(evt.currentTarget).prev(), $(evt.currentTarget), $(evt.currentTarget).next());
   	});
   	function updateurl (time, url, target) {
   		target.val('{ "timeline": "' + time.val() + '", "url": "' + url.val() + '" }');
   	};


 /*SCROLL*/

 	function changeSize() {
        var width = parseInt($("#Width").val());
        var height = parseInt($("#Height").val());

        if(!width || isNaN(width)) {
            width = 100;
        }
        if(!height || isNaN(height)) {
            height = 300;
        }
        $(".title").width(width).height(height);

        // update perfect scrollbar
        $('.title').perfectScrollbar('update');
    }
    $(function() {
        $('.title').perfectScrollbar();
    });
     var closeAll=function() {
		$('.mail').removeClass('open');
		$('.back-container').removeClass('open');
		$('#feedback  .my_info, #feedback  .my_mesage').val('')
		$('.button_pushmenu, .logmenu_btn-home,.menu_btn').removeClass('open');
		$('.push-container').removeClass('open');
		close_popup($('.popup-login'));  
 	}

	var more_info = $('.more_info');
	more_info.click(function () {
		$(this).toggleClass('open');
		//$(this).siblings().removeClass('open');
	});
		/*Открыть все списки и закрыть*/
	$('.open-all').click(function(){
		$(".more_info").addClass('open')
	});
	$('.close-all').click(function(){
		$('.more_info').siblings().removeClass('open')
	});

	/*слайдер в профиле*/
	$('.my-album').lgCarousel({
		sliderBox: '.albums',
		nextCls: 'slide_right',
		prevCls: 'slide_left'
	});
	$('.my_video').lgCarousel({
		sliderBox: '.videos',
		nextCls: 'slide_right',
		prevCls: 'slide_left'
	});
	$('.my_action').lgCarousel({
		sliderBox: '.actions',
		nextCls: 'slide_right',
		prevCls: 'slide_left'
	});


	/* Вкладки*/
	var folder = $('.folder');
	var cnt = $('.js-folder');
	folder.click(function () {
		if($(this).hasClass('active')) return;
		$(this).addClass('active');
		$(this).siblings().removeClass('active');
		cnt.removeClass('active');
		$(cnt[$(this).index()]).addClass('active');
	});

	function initProfileEdit (argument) {
		$('.write').addClass("setting");
		$('.under').addClass("setting");
		$('.more_info').addClass("setting");
		$(".container-settings").addClass('setting');
		$('.set').removeAttr('readonly');
		$('.email').attr("readonly", "");
		$('.dpickerRead').hide();
		$('.dpickerEdit').show();
		$('.go-to-social').hide();
		$('.go-to-social-edit').show();
		$(".view-name").hide();
		$(".editor-name").show();

	}
	function cancelProfileEdit (argument) {
		$('.write').removeClass("setting");
		$('.under').removeClass("setting");
		$('.more_info').removeClass("setting");
		$(".container-settings").removeClass('setting');
		$('.set').attr('readonly', '');
		//$('.inputDate').attr('readonly', '');
		$('.dpickerEdit').hide();
		$('.dpickerRead').show();
		$('.go-to-social').show();
		$('.go-to-social-edit').hide();
		$(".view-name").show();
		$(".editor-name").hide();
	}
	function saveProfileEdit (argument) {
		var regmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		var fio = /^[_a-zA-Z0-9абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ ]+$/;
		var url = /^(?:([a-z]+):(?:([a-z]*):)?\/\/)?(?:([^:@]*)(?::([^:@]*))?@)?((?:[a-z0-9_-]+\.)+[a-z]{2,}|localhost|(?:(?:[01]?\d\d?|2[0-4]\d|25[0-5])\.){3}(?:(?:[01]?\d\d?|2[0-4]\d|25[0-5])))(?::(\d+))?(?:([^:\?\#]+))?(?:\?([^\#]+))?(?:\#([^\s]+))?$/i;
		var regurlvk = /^(https?:\/\/)?([\w\.]+)\.([a-z]{2,6}\.?)(\/[\w\.]*)*\/?$/
		var urlFacebook = true, urlUser = true, urlVk = true;
		if ($("#profUrlFacebook").val()) {
			if (url.test($("#profUrlFacebook").val())) {
				urlFacebook = true;
			} else {urlFacebook = false;}
		}
		if ($("#profUrlVk").val()) {
			if (url.test($("#profUrlVk").val())) {
				urlVk = true;
			} else {
				urlVk = false;
			}
		}
		if ($("#profUrlUser").val()) {
			if (url.test($("#profUrlUser").val())) {
				urlUser = true;
			} else {
				urlUser = false;
			}			
		}
		if (urlFacebook&&urlVk&&urlUser&&regmail.test($("#profEmail").val())&&fio.test($("#profName").val())&&fio.test($("#profFName").val())&&fio.test($("#profFam").val())) {
			$('#profile').ajaxSubmit({
				error: function(xhr) {
					open_popup($(".popup-error-empass"));
				},
				success: function(response) {
					if (response.ch.email!=response.ch.lastemail || response.ch.password)
					{
						closeAll();
						open_popup($('.popup-empass-changed'));
						$("#profnewPass").val("");
						$("#profnewPass-encore").val("");
					}
					$(".nameSpan").html($("#profName").val());
					$(".fanameSpan").html($("#profFName").val());
					$(".familySpan").html($("#profFam").val());

					profilVk = $("#profUrlVk").val();
					profilFacebook = $("#profUrlFacebook").val();
					profilUser = $("#profUrlUser").val();

					if (profilVk&&(profilVk.indexOf("http://") == -1)&&(profilVk.indexOf("https://") == -1) ) {
						profilVk = "http://"+profilVk;
					}
					if (profilFacebook&&(profilFacebook.indexOf("http://") == -1)&&(profilFacebook.indexOf("https://") == -1)) {
						profilFacebook = "http://"+profilFacebook;
					}
					if (profilUser&&(profilUser.indexOf("http://") == -1)&&(data.urlUser.indexOf("https://") == -1)) {
						profilUser = "http://"+profilUser;
					}

					$("#profUrlVk").val(profilVk);
					$("#profUrlFacebook").val(profilFacebook);
					$("#profUrlUser").val(profilUser);

					if (profilUser) {
						$(".personal-site").html("<a  target='_blank' class='in-social' href='"+profilUser+"'>Личный сайт</a><br>");
					} else {
						$(".personal-site").html(" ");		
					}
					if ($("#profUrlFacebook").val()) {
						$(".facebook-profile").html("<img src='img/facebook-profil.png' class='soc-img'><a  target='_blank' class='in-social' href='"+$("#profUrlFacebook").val()+"'>Страница Facebook</a><br>");
					} else {
						$(".facebook-profile").html(" ");
					}
					if ($("#profUrlVk").val()){
						$(".vk-profile").html("<img src='img/vk-profil.png' class='soc-img'><a  target='_blank' class='in-social' href='"+$("#profUrlVk").val()+"'>Страница ВКонтакте</a><br>");
					} else {
						$(".vk-profile").html(" ");
					}
				}
			});
		} else {
			errs = "";
			if (!regmail.test($("#profEmail").val())) {errs = errs + "Неверный формат емайл. ";}
			if (!fio.test($("#profName").val())) {errs = errs + "Неверный формат имени. ";}
			if (!fio.test($("#profFName").val())){ errs = errs + "Неверный формат отчества. ";}
			if (!fio.test($("#profFam").val())) {errs = errs + "Неверный формат фамилии. ";}
			if (!urlFacebook) {errs = errs + "Неверный формат ссылки на профиль Facebook. ";}
			if (!urlVk) {errs = errs + "Неверный формат ссылки на профиль ВКонтакте. ";}
			if (!urlUser){ errs = errs + "Неверный формат ссылки на личный сайт. ";}
			alert(errs);
			window.location.reload(true);
		}	
	}
	
	//Изменение профиля
	$(".canceleditprofile").click(function(){
		cancelProfileEdit();

	});
	//Сохранение профиля
	$(".saveeditprofile").click(function(){
		cancelProfileEdit();
		saveProfileEdit();
		$('.dpickerRead').val($('.dpickerEdit').val());
	});

	/*Настройки профиля*/
	$(".settings").click(function(){
		initProfileEdit();
	});
	$(".category").on('change', function (e) {
		var arr = [];
		var parent = $(this).closest('.spoiler');
		var chack = parent.find('.category');
		var item = parent.find('.item');
		chack.each(function(key,el){
			if($(el).is(':checked')) arr.push($(el).next().text())
		})
		item.text(arr.join(','));
	});
	$('.fresh').on('click', function  (argument) {
		return false;
	})
	$(".category").on('change', function (e) {
		var arr = [];
		var parent = $(this).closest('.edit-inform-sex');
		var chack = parent.find('.category');
		var item = parent.find('.sex');
		chack.each(function(key,el){
			if($(el).is(':checked')) arr.push($(el).next().text())
		})
		item.text(arr.join(','));
	});
 
    // Мониторинг наличия выбранного файла 
    function lookFile () {
	    var timerId;
	    timerId = setInterval(function() {
		if($('#file').val() !== '') {
				// Если файл выбран, останавливаем мониторинг
	            clearInterval(timerId);
	 			// и отправляем форму, имя отправленного файла запоминается в сессии 
	 			// и отправляется в ответе при удачной загрузке
	 			$('#invite_form').attr('action', '/rest/invloader');
	            $('#invite_form').submit();
	        }
	    }, 500);
	}
	//запускаем мониторинг
 	lookFile();
 	// меняем стандартную функцию сабмита формы
    $('#invite_form').submit(function() {
    	// Сообщаем о начале загрузки
    	if ($('#invite_form').attr('action')=='/rest/invloader') {
	    	$('#invite_form .upload').html('Идет загрузка: 0%');
	    	// блокируем кнопку выбора файла для предотвращения повторного выбора
	 		$('#invite_form .upload-button').attr("disabled", "disabled");
	 		// запускаем ajax загрузку
	 		$('#video-element').html("");
	        $(this).ajaxSubmit({                                                                                                                 
	 			// если ошибка, предлагаем попробывать еще раз
	            error: function(xhr) {
					$('#invite_form .upload').html('Ошибка загрузки, попробуйте еще раз');
	 				$('#invite_form .upload-button').removeAttr("disabled");
	 				$('#invite_form .upload-button').html("Загрузить");
					$('.submit-upload').remove();
		 			$('.upload-button').after($('<input type="file" class="submit-upload" name="file" id="file" accept="video/*">'));
		 			$('#invite_form').attr('action', '/invite');
		 			lookFile();
	            },
	 			// если все ок, сообщаем о возможности заменить ролик
	            success: function(response) {
					$('#invite_form .upload').html('Вы можете изменить загруженный ролик');
	 				$('#invite_form .upload-button').removeAttr("disabled");
	 				$('#invite_form .upload-button').html("Заменить");
					$('.submit-upload').remove();
		 			$('.upload-button').after($('<input type="file" class="submit-upload" name="file" id="file" accept="video/*">'));
		 			$('#invite_form').attr('action', '/invite');
		 			// TODO: реализовать вывод загруженного файла для предварительного просмотра, 
		 			// в ответе придет json вида {"error": null,"path": [url до файла] }

						$('#video-element').html(
							'<input type="text" class="input-time" name="filetime" id="filetime" placeholder="Напишите тот отрезок времени в видео, где присутствуете именно Вы" value=""><img src="' +
							response.path+'.jpg"  width="640" height="360" />'							
	/*'<video controls="" poster="'+response.path+'.jpg"  width="640" height="360" name="media"><source src="'+response.path+'" type="video/mp4"></video>'*/
							);
						
					
		 			lookFile();

	            },
	            // сообщаем о прогрессе загрузки файла
	            uploadProgress: function (ev, pos, total, percent) {
	            	$('#invite_form .upload').html('Идет загрузка: '+percent+'%');
	            }
			});
		 
			// останавливаем стандартную обработку события и предотвращаем перезагрузку страницы
			return false;
		}
    });



	$('.addurl-button').click(function (ev) {
		var addurl = $('<input type="text" name="justTimeline" form="invite_form" class="input-time urltime" placeholder="Напишите тот отрезок времени в видео, где присутствуете именно Вы" value="">' +
    					'<input type="text" class="input-href urlurl" name="justUrl" form="invite_form" placeholder="А также можете добавить ссылку на ресурс с вашим видео" value="">' +
    					'<input type="hidden" name="url" id="url[]" class="urlval" value="">');
		$(ev.currentTarget.parentElement).before(addurl);
	});
	var innerChAva = $('.popup-photo-editor').html();
	/*Загрузка фото на аватарку*/
	$('.my_photoload').click(function(){
		$('.please_load').trigger('click');
	});
	$('.please_load').change(function () {
		var checkFile = {
				type: /img/,
				size: 1048576 * 5,
				name: /^.+\.(jpg|png|jpeg|JPG|PNG|JPEG|)$/
		}
		var fi = $('.please_load');
		var file = fi[0].files[0];
		if (/*checkFile.type.test(file.type) && */checkFile.name.test(file.name) && checkFile.size > file.size) {
			$('.error-File').removeClass('error-true').addClass('error-false').html('');
			$("#changeAva").submit();
		} else { 			
			$('.please_load').remove();
			$('.my_photoload').after($('<input type="file" class="please_load">'));
		}
/*		var FR = new FileReader(); 
		FR.onload = function(e) {
			debugger
			$('.profil-foto').attr("src", e.target.result); 
		};
		FR.readAsDataURL( this.files[0] );*/
	});
	$("#changeAva").submit(function() {

    	// Сообщаем о начале загрузки
    	if ($('#changeAva').attr('action')=='/rest/prephoto') {
/*	    	$('#changeAva .upload').html('Идет загрузка: 0%');
	    	// блокируем кнопку выбора файла для предотвращения повторного выбора
	 		$('#invite_form .upload-button').attr("disabled", "disabled");*/
	 		// запускаем ajax загрузку

	        $(this).ajaxSubmit({                                                                                                                 
	 			// если ошибка, предлагаем попробывать еще раз
	            error: function(xhr) {
	            },
	 			// если все ок, сообщаем о возможности заменить ролик
	            success: function(response) {
	            	var cropData;
	            	open_popup($('.popup-photo-editor'));
	            	var editor = $('#editor');
	            	editor.attr('src', response.path);
	            	editor.Jcrop({
	            		aspectRatio: 290/291,
	            		onSelect: function (area) {
	            			cropData = area;
	            		}
	            	});

	            	$('.btn_save_photo').click(function () {
	            		var f = editor[0].naturalHeight / 345;
	            		if (cropData) {
		            		$.post('/rest/savephoto', {
		            			w:cropData.w*f,
		            			h:cropData.h*f,
		            			x:cropData.x*f,
		            			y:cropData.y*f,
		            			x2:cropData.x2*f,
		            			y2:cropData.y2*f
		            		},
		            			function (response) {
		            				window.location.reload(true);
		            				// $('.profil-foto').attr('src', response.path);
		            				// close_popup($('.popup-photo-editor'));
		            				// $('.popup-photo-editor').html(innerChAva);

		               		});
		               	} else {
		               		$(".autorisation").attr("style", "color: maroon");
		               		$(".autorisation").text("Необходимо выделить фрагмент изображения!");
		               	}
	            		return false;
	            	})

	            },
	            // сообщаем о прогрессе загрузки файла
	            uploadProgress: function (ev, pos, total, percent) {
	            	//debugger;
	            }
			});
		 
			// останавливаем стандартную обработку события и предотвращаем перезагрузку страницы
			return false;
		}
	});

	/*Список настроек видимости*/
	
	$('.edit-visible').on('mouseup',function () {
		var dropText = $(this).children('.name-visible');			
		var dropList = $(this).children('.title-vis');
		var chack = dropList.children('input');
		if(dropList.hasClass('hide')) dropList.removeClass('hide'); else return false;
		$(window).on('mousedown',function (e) {	
			if($(e.target).closest('.title-vis').length){						
				return false;
			}
			$(window).off('mousedown');
			dropList.addClass('hide');	
		});
	});

	var now = new Date();
		$('.inputDate').DatePicker({
	        format:'d/m/Y',
	        date: $('.inputDate').val() || now,
	        current: $('.inputDate').val() || now,
	        starts: 1,
	        position: 'right',
	        onBeforeShow: function(){
	            $('.inputDate').DatePickerSetDate($('.inputDate').val() || now, true);
	        },
	        onChange: function(formated, dates){
	            $('.inputDate').val(formated);
	            if ($('#closeOnSelect input').attr('checked')) {
	                $('.inputDate').DatePickerHide();
	            }
	        }
	    });

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

	$(".create-album").click(function(){
		open_popup($('.create-container'));
	});

	$('.btn-close').click(function() {
		$('#hide-layout,.create-container').fadeOut(300);
		close_popup($('.popup-photo-editor, .popup-actface-editor'));
		$('.popup-photo-editor').html(innerChAva);

	});
	// Ajax отправка ответа
	$('.fbAnswer-ok').click( function() {
		$(this).remove();
		$.ajax({
			url: "/rest/sendAnswer",
			type: "post",
			data: {
				name: $("#FeedbackName").val(),
				email: $("#FeedbackEmail").val(),
				msg: $("#Answer").val(),
				_id: $("#FeedbackId").val()
			},
			success: function (res) {
				alert("Письмо отправлено");
				window.location.href = "/admin/feedbacks";
			},
			error: function() {
				alert("error");
				window.location.reload(true);
			}
		})
	});
	function resizeInput() {
   	 $(this).attr('size', $(this).val().length+1);
	}

	$('input.profio')
	    // event handler
	    .keyup(resizeInput)
	    // resize on page load
	    .each(resizeInput);

// Удаление\добавление словарей из админки Ajax
$(".dictdelete").click( function() {
	$(this).hide();
	$('#'+$(this).attr("id")).hide();
	$.ajax({
		url: "/rest/admindicts",
		type: "post",
		data: {
			type: "delete",
			code: $(this).attr("id")
		},
		success: function() {

		},
		error: function () {
			alert("Не получилось удалить");
		}
	})
});
$(".newdict").click( function() {
	var el = $(this);
	var id = $('#'+el.attr("id")).val()
	$.ajax({
		url: "/rest/admindicts",
		type: "post",
		data: {
			title: id,
			type: "add",
			code: el.attr("id")
		},
		success: function() {/*
			alert("Запись успешно добавлена");*/
			$('#addNewLabel').after("<li><input type='text' value='" + id + 
															"' readonly></li>");
			$('#'+el.attr("id")).val("");
			window.location.reload(true);
		},
		error: function () {
			alert("Не получилось добавить запись");
		}
	});
});

$('.btn-back').click( function(res) {
	window.location.replace("/search");
});


$(".page").click( function() {
	var arr = window.location.search.split("&");
	for (e in arr) {
		if ((arr[e].indexOf("page")+1)) {
			arr.splice(e, 1);
		}
	}
	get = arr.join("&");

	var queryChar = (window.location.pathname.indexOf("?")+1 || get.indexOf("?")+1) ? "" : "?";
	window.location.replace("/search/resOfSearch" + queryChar +get+ "&page=" + 
															$(this).attr("id"));
});
$(".pageAlb").click( function() {
	var arr = window.location.search.split("&");
	for (e in arr) {
		if ((arr[e].indexOf("page")+1)) {
			arr.splice(e, 1);
		}
	}
	get = arr.join("&");
	var queryChar = (window.location.pathname.indexOf("?")+1 || get.indexOf("?")+1) ? "" : "?";
	window.location.replace(window.location.pathname + queryChar +get+ "&page="+$(this).attr("id"));
});

$(".adminRedactSubmit").click( function() {
	$('#adminRedact').ajaxSubmit({
		error: function(xhr) {
			alert("Ошибка сохранения");
		},
		success: function(response) {
			alert("Пользователь сохранен");
			cancelProfileEdit();
		}
	});	
});
$(".sendNegativeMessageSubmit").click( function() {
	$('#sendNMForm').ajaxSubmit({
		error: function(xhr) {
			alert("Ошибка отправка письма");
		},
		success: function(response) {
			alert("Письмо отправлено");
		}
	});	
});

$('.btn-create').click( function() {
	$.ajax({
		url: "/rest/createAlbum",
		method: "POST",
		data: {
			name: $(".new-name").val(),
			description: $(".about_album").val()
		},
		error: function () {
			alert("Ошибка добавления альбома");
		},
		success: function (res) {
			alert("Альбом добавлен");
			window.location.reload(true);
		}
	})
});
$('.btn-createValb').click( function() {
	$.ajax({
		url: "/rest/createValbum",
		method: "POST",
		data: {
			name: $(".new-name").val(),
			description: $(".about_album").val()
		},
		error: function () {
			alert("Ошибка добавления альбома");
		},
		success: function (res) {
			alert("Альбом добавлен");
			window.location.reload(true);
		}
	})
});

$(".delete-album").click( function () {
	$.ajax({
		method: "POST",
		url: "/album/deleteAlb",
		data: {
			id: $(".delete-album").attr("for")
		},
		error: function (xhr) {
			alert("Ошибка удаления");
		},
		succes: function (res) {
			alert("Удаление успешно завершено");
			window.location.href = "/album?id="+$(".delete-album").attr("for");
		}
	});
});


$("#uploadProcessSubmit").click( function () {
	$("#uploadProcess").ajaxSubmit({
		error: function (xhr) {
			alert("Ошибка");
		},
		success: function (res) {
			alert("Фотографии загружены");
		}
	});
});

$(".showAddPhoto").click( function () {
	$(".addPhoto_window").show();
	$(".blackout").show();
});
$(".addPhoto-close").click( function() {
	$(".addPhoto_window").hide();
	$(".blackout").hide()
	$(".viewPhoto_window").hide();
});
$(".showAddVideo").click( function () {
	$(".addVideo_window").show();
	$(".blackout").show();
});
$(".addVideo-close").click( function() {
	$(".addVideo_window").hide();
	$(".blackout").hide()
	$(".viewVideo_window").hide();
});

//объявляем переменную для использования ее в другой фукнции
var glPath = String;
$(".inputPhotoUpload").change( function () {
	$("#uploadProcess").ajaxSubmit({
		success: function (res) {
			if (res.error) {
				alert(error);
			}
			if (res.path) {
				glPath = res.path;
				html = "<center>";
				html = html+"<img src='"+res.path+"' width=200>";
				html = html+"</center>";
				html = html+"<input type='text' name='name' class='NameText' placeholder='Введите название фотографии'><br>";
				html = html+"<input type='text' class='DescText' name='description' placeholder='Описание фотографии'><br>";
				html = html+"<BR>";
				html = html+"<input type='submit' class='photo_ajax' for='save' value='Сохранить'>";
				html = html+"<input type='submit' class='photo_ajax' for='delete' value='Удалить'>";
				// Подгружаем уменьшенную фотографию в форму
				$("#uploadProcess").before(html);
				$(".inputPhotoUpload").remove();
			} else {
				alert(res.msg);
			}
		},
		error: function (xhr) {
			alert("Error!");
		}
	});
});

var glPath = String;
$(".inputVideoUpload").change( function () {
	$("#uploadProcess").ajaxSubmit({
		success: function (res) {
			if (res.error) {
				alert(error);
			}
			if (res.path) {
				glPath = res.path;
				html = "<center>";
				html = html+"<img src='"+res.path+"' width=200>";
				html = html+"</center>";
				html = html+"<input type='text' name='name' class='NameText' placeholder='Введите название'><br>";
				html = html+"<input type='text' class='DescText' name='description' placeholder='Описание'><br>";
				html = html+"<BR>";
				html = html+"<input type='submit' class='video_ajax' for='save' value='Сохранить'>";
				html = html+"<input type='submit' class='video_ajax' for='delete' value='Удалить'>";
				// Подгружаем уменьшенную фотографию в форму
				$("#uploadProcess").before(html);
				$(".inputVideoUpload").remove();
			} else {
				alert(res.msg);
			}
		},
		error: function (xhr) {
			alert("Error!");
		}
	});
});

var glPath = String;
$("body").on('click', '.video_ajax' , function () {
	$.ajax({
		url: "/valbum/video_ajax",
		method: "POST",
		data: {
			type: $(this).attr("for"),
			path: glPath,
			name: $(".NameText").val(),
			description: $(".DescText").val(),
			valbum_id: $(".valbId").val(),
		},
		success: function (res) {
			alert("Операция завершена успешно");
			window.location.reload(true);
		},
		error: function (xhr) {
			alert("Error!");
		}
	})
});

$("body").on('click', '.photo_ajax' , function () {
	$.ajax({
		url: "/album/photo_ajax",
		method: "POST",
		data: {
			type: $(this).attr("for"),
			path: glPath,
			name: $(".NameText").val(),
			description: $(".DescText").val(),
			album_id: $(".albId").val(),
			user: $(".album-user-id").val()
		},
		success: function (res) {
			alert("Операция завершена успешно");
			window.location.reload(true);
		},
		error: function (xhr) {
			alert("Error!");
		}
	})
});

$(".photoClickView").click( function () {
	$(".viewPhoto_window").show();
	$(".blackout").show();

	$.ajax({
		url: "/album/getPhoto",
		method: "POST",
		data: {
			id: $(this).attr("for")
		},
		success: function (res) {
			if (res.photo) {
				if ($("div").is(".showAddPhoto")) {
					class1 = 'photoNameValue';
					class2 = 'photoDescValue';
				} else {
					class1 = '';
					class2 = '';
				}
				html = "<img src='"+res.photo.path+"' width='300' height=300>";
				html = html+"<input type='hidden' class='photo_path' value='"+res.photo.path+"'>";
				html = html+"<br>Название: <input class='"+class1+"' name='photoName' type=text readonly value='"+res.photo.name+"'><br>";
				html = html+"<br>Описание: <input class='"+class2+"' name='photoDesc' type=text readonly value='"+res.photo.description+"'><br>";
				if ($("div").is(".showAddPhoto")) {
					html = html+"<br><input type=submit class='deletePhotoButton' value='Удалить фотографию'>";
					html = html+"<input type=submit class='editPhotoInfo' value='Редактировать'>";
					html = html+"<br><input type=submit class='setAlbumFace' value='Сделать обложкой альбома'>";
				}
				$(".insertPhoto").html(html);
			} else {
				alert("Такой фотографии не существует");
			}
		},
		error: function (xhr) {
			alert("Ошибка");
		}
	});
});

$(".videoClickView").click( function () {
	$(".viewVideo_window").show();
	$(".blackout").show();

	$.ajax({
		url: "/valbum/getVideo",
		method: "POST",
		data: {
			id: $(this).attr("for")
		},
		success: function (res) {
			if (res.video) {
				if ($("div").is(".showAddVideo")) {
					class1 = 'videoNameValue';
					class2 = 'videoDescValue';
				} else {
					class1 = '';
					class2 = '';
				}
				html = "<video controls preload=auto width=300 height=200>";
				html = html+"<source src='<%- res.video.path %>' type='video/mp4' /></video>";
				html = html+"<input type='hidden' class='video_path' value='"+res.video.path+"'>";
				html = html+"<br>Название: <input class='"+class1+"' name='videoName' type=text readonly value='"+res.video.name+"'><br>";
				html = html+"<br>Описание: <input class='"+class2+"' name='videoDesc' type=text readonly value='"+res.video.description+"'><br>";
				if ($("div").is(".showAddVideo")) {
					html = html+"<br><input type=submit class='deleteVideoButton' value='Удалить'>";
					html = html+"<input type=submit class='editVideoInfo' value='Редактировать'>";
					//html = html+"<br><input type=submit class='setAlbumFace' value='Сделать обложкой альбома'>";
				}
				$(".insertVideo").html(html);
			} else {
				alert("Такого видео не существует");
			}
		},
		error: function (xhr) {
			alert("Ошибка");
		}
	});
});

$("body").on('click', '.editVideoInfo', function(){
	$(".videoNameValue").removeAttr("readonly");
	$(".videoDescValue").removeAttr("readonly");
	$(".deleteVideoButton").after("<input type='submit' class='SaveEditVideoButton' value='Сохранить'>");
	$(this).remove();
});

$("body").on('click', '.SaveEditVideoButton', function () {
	$(".videoNameValue").attr("readonly",'');
	$(".videoDescValue").attr("readonly",'');	
	$(this).remove();
	$(".deleteVideoButton").after("<input type=submit class='editVideoInfo' value='Редактировать'>");
	$.ajax({
		url: "/valbum/video_ajax",
		method: "POST",
		data: {
			type: "app_save",
			name: $(".videoNameValue").val(),
			description: $(".videoDescValue").val(),
			path: $(".video_path").val()
		},
		success: function (res) {
		},
		error: function (xhr) {
			alert("Ошибка");
		}
	})
});

$("body").on('click', '.deleteVideoButton', function () {
	$.ajax({
		url: "/valbum/video_ajax",
		method: "POST",
		data: {
			path: $(".video_path").val(),
			type: "delete"
		},
		success: function (res) {
			$(".insertVideo").html("Фотография удалена");
			window.location.reload(true);
		},
		error: function (xhr) {
			alert("Ошибка");
		}
	})
});

$("body").on('click', '.editPhotoInfo', function(){
	$(".photoNameValue").removeAttr("readonly");
	$(".photoDescValue").removeAttr("readonly");
	$(".deletePhotoButton").after("<input type='submit' class='SaveEditPhotoButton' value='Сохранить'>");
	$(this).remove();
});

$("body").on('click', '.SaveEditPhotoButton', function () {
	$(".photoNameValue").attr("readonly",'');
	$(".photoDescValue").attr("readonly",'');	
	$(this).remove();
	$(".deletePhotoButton").after("<input type=submit class='editPhotoInfo' value='Редактировать'>");
	$.ajax({
		url: "/album/photo_ajax",
		method: "POST",
		data: {
			type: "app_save",
			name: $(".photoNameValue").val(),
			description: $(".photoDescValue").val(),
			path: $(".photo_path").val()
		},
		success: function (res) {
		},
		error: function (xhr) {
			alert("Ошибка");
		}
	})
});

$("body").on('click', '.deletePhotoButton', function () {
	$.ajax({
		url: "/album/photo_ajax",
		method: "POST",
		data: {
			path: $(".photo_path").val(),
			type: "delete"
		},
		success: function (res) {
			$(".insertPhoto").html("Фотография удалена");
			window.location.reload(true);
		},
		error: function (xhr) {
			alert("Ошибка");
		}
	})
});

	$("body").on("click", ".setAlbumFace", function () {
		$.ajax({
			url: "/album/setAlbumFace",
			method: "POST",
			data: {
				path: $(".photo_path").val(),
				id_album: $(".inputAlbumId").val()
			},
			success: function (res) {
				alert("Обложка фотоальбома установлена");
			},
			error: function (xhr) {
				alert("Ошибка!");
			}
		})
	});

/* ADMIN panels */
	$(".photoCont, .videoCont").change( function () {
		$("form#actAdminUpdate").ajaxSubmit({
			success: function (res) {
				if (res.photo) {
					$(".photoAddCount").after("<span class='deleted' style='color: green; margin-left: 10px;'>Фото добавлено!</span>");
					setTimeout( function () {
						$(".deleted").html(" ");
					}, 500);
					$(".text-added").html("Фотографий добавлено: ");
					$(".photoAddCount").html( $(".photoAddCount").html() ? (parseInt($(".photoAddCount").html())+1) : "1" );
				}
				if (res.video) {
					$(".videoAddCount").after("<span class='deleted' style='color: green; margin-left: 10px;'>Видео добавлено!</span>");
					setTimeout( function () {
						$(".deleted").html(" ");
					}, 500);
					$(".text-added-v").html("Видео добавлено: ");
					$(".videoAddCount").html( $(".videoAddCount").html() ? (parseInt($(".videoAddCount").html())+1) : "1" );	
				}
				$(".uploadprogress").html("");
			},
			error: function (err) {
				alert(err);
				$(".uploadprogress").html("");
			},
			uploadProgress: function (ev, pos, total, percent) {
				$(".uploadprogress").html(percent+"%");
			}
		});

		//Очищаем поля
		var control = $(".photoCont");
		control.replaceWith( control = control.clone( true ) );
		var control = $(".videoCont");
		control.replaceWith( control = control.clone( true ) );
	});

	$('.cleanRating').click( function () {
		$('[name=profRating]').removeAttr('checked');
		$('.nullRate').attr('checked');
	})

	var now = new Date();
		$('.inputDateFinish').DatePicker({
	        format:'m/d/Y',
	        date: $('.inputDateFinish').val() || now,
	        current: $('.inputDateFinish').val() || now,
	        starts: 1,
	        position: 'right',
	        onBeforeShow: function(){
	            $('.inputDateFinish').DatePickerSetDate($('.inputDateFinish').val() || now, true);
	        },
	        onChange: function(formated, dates){
	            $('.inputDateFinish').val(formated);
	            if ($('#closeOnSelect input').attr('checked')) {
	                $('.inputDateFinish').DatePickerHide();
	            }
	        }
	    });

	var now = new Date();
		$('.inputDateBegin').DatePicker({
	        format:'m/d/Y',
	        date: $('.inputDateBegin').val() || now,
	        current: $('.inputDateBegin').val() || now,
	        starts: 1,
	        position: 'right',
	        onBeforeShow: function(){
	            $('.inputDateBegin').DatePickerSetDate($('.inputDateBegin').val() || now, true);
	        },
	        onChange: function(formated, dates){
	            $('.inputDateBegin').val(formated);
	            if ($('#closeOnSelect input').attr('checked')) {
	                $('.inputDateBegin').DatePickerHide();
	            }
	        }
	    });

});