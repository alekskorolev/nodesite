
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
		    	$('.error_line').fadeIn(50).delay(500).fadeOut(300);
		    }
		  });
		  return false;
	});
	$('.invSend').click(function (event) {
		$.post( "/rest/invsend", {id: event.target.id})
		  .done(function( data ) {
		  	alert( "Результат отправки: " + data );
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
			close_popup($('.popup-login'));
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
			$.post( "rest/feedback", postData)
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

 	/*$('.upload-button').click(function(){
    
    $('.submit-upload').trigger('click');
	});*/
 	$('.submit-upload').change(function () {
 		var checkFile = {
 				type: /^video\/.+$/,
 				size: 1048576000,
 				name: /^.+\.(flv|mp4|3gp|avi)$/
 		}
 		var fi = $('.submit-upload');
 		var file = fi[0].files[0];
 		if (checkFile.type.test(file.type) && checkFile.name.test(file.name) && checkFile.size > file.size) {
 			$('.error-File').removeClass('error-true').addClass('error-false').html('');
 		} else {
 			
 			$('.submit-upload').remove();
 			$('.upload-button').after($('<input type="file" class="submit-upload" name="inviteVideo" id="inviteVideo" accept="video/*">'));
 			$('.error-File').removeClass('error-false').addClass('error-true').html('Некоректный файл');
  		}
   	});
 	$('#inviteUrl').click(function () {
 		$('#inviteUrl').val("");
 		$('.submit-upload').remove();
			$('.upload-button').after($('<input type="file" class="submit-upload" name="inviteVideo" id="inviteVideo" accept="video/*">'));
 	})
 	

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

	/*Настройки профиля*/
		$(".settings").click(function(){
			$('.write').toggleClass("setting");
			$('.more_info').toggleClass("setting");
			$('.set').removeAttr('readonly');
			$(".container-settings").toggleClass('setting');
		});
		$(".category").on('change', function (e) {
			var arr = [];
			var parent = $(this).closest('.spoiler');
			var chack = parent.find('.category');
			var item = parent.find('.item');
			chack.each(function(key,el){
				if($(el).is(':checked')) arr.push($(el).next().text())
			})
			item.text(arr.join(' '));
		});

    // Мониторинг наличия выбранного файла 
    function lookFile () {
	    var timerId;
	    timerId = setInterval(function() {
		if($('#inviteVideo').val() !== '') {
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

	        $(this).ajaxSubmit({                                                                                                                 
	 			// если ошибка, предлагаем попробывать еще раз
	            error: function(xhr) {
					$('#invite_form .upload').html('Ошибка загрузки, попробуйте еще раз');
	 				$('#invite_form .upload-button').removeAttr("disabled");
	 				$('#invite_form .upload-button').html("Загрузить");
					$('.submit-upload').remove();
		 			$('.upload-button').after($('<input type="file" class="submit-upload" name="inviteVideo" id="inviteVideo" accept="video/*">'));
		 			$('#invite_form').attr('action', '/invite');
		 			lookFile();
	            },
	 			// если все ок, сообщаем о возможности заменить ролик
	            success: function(response) {
					$('#invite_form .upload').html('Вы можете изменить загруженный ролик');
	 				$('#invite_form .upload-button').removeAttr("disabled");
	 				$('#invite_form .upload-button').html("Заменить");
					$('.submit-upload').remove();
		 			$('.upload-button').after($('<input type="file" class="submit-upload" name="inviteVideo" id="inviteVideo" accept="video/*">'));
		 			$('#invite_form').attr('action', '/invite');
		 			// TODO: реализовать вывод загруженного файла для предварительного просмотра, 
		 			// в ответе придет json вида {"error": null,"path": [url до файла] }

						$('#video-element').html(
	'<video controls="" poster="'+response.path+'.jpg" name="media"><source src="'+response.path+'" type="video/mp4"></video>'
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
		var addurl = '<input type="text" class="input-href" placeholder="Еще ссылки"  name="inviteUrl" id="inviteUrl">'
		$(ev.currentTarget.parentElement).before(addurl);
	});

	/*Загрузка фото на аватарку*/
	$('.my_photoload').click(function(){
		$('.please_load').trigger('click');
	});

	$('.please_load').change(function () {
		var checkFile = {
				type: /img/,
				size: 1048576,
				name: /^.+\.(jpg|png|jpeg|)$/
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

	            		$.post('/rest/savephoto', {
	            			w:cropData.w*f,
	            			h:cropData.h*f,
	            			x:cropData.x*f,
	            			y:cropData.y*f,
	            			x2:cropData.x2*f,
	            			y2:cropData.y2*f
	            		},
	            			function (response) {
	            				$('.profil-foto').attr('src', response.path);
	            				close_popup($('.popup-photo-editor'));

	               		});
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
	
});
function preview(img, selection) {
    if (!selection.width || !selection.height)
        return;	
    $('.x1').val(selection.x1*sizefactor);
    $('.y1').val(selection.y1*sizefactor);
    $('.x2').val(selection.x2*sizefactor);
    $('.y2').val(selection.y2*sizefactor);
    $('.width').val(selection.width*sizefactor);
    $('.height').val(selection.height*sizefactor);
	$('#preview').css({'width':selection.width+'px','height':selection.height+'px'});
	selWidth=selection.width;
	selHeight=selection.height;
	$('#preview img').css({'left':'-'+selection.x1+'px','top':'-'+selection.y1+'px'});
}