$(function () {		
	// Функция загрузки фотографии в окно просмотра фотографии
	function loadPhoto () {

		$(".photo-watch-name").val(" ");
		$(".photo-description").val(" ");
		$(".photo-watch-data").html(" ");
		$(".photo-container").css("height", "512px");
		$(".photo-container").css("padding-top", "0px");
		$(".photo-container").html("<img src='../img/ajax-loader.gif' style='margin: 0px auto; margin: 251px;'>");
		$(".index-of-photo-now").html(parseInt($(".photo-now").val())+1);
		$(".delete-this-photo").attr("num", $(".photo-now").val());
		
		$.ajax ({
			method: "POST",
			url: "/album/photoInfo",
			data: {
				prevPath: $(".src-of-num-"+($(".photo-now").val())).val() 
			},
			success: function (photo) {
			// Открываем окно просмотра фотографий, предварительно определив, горизонтальное или верт. изображние
				//Определяем вертикаль\горизонталь
				var img = new Image();
				var pos = "";
				img.onload = function () {
					var ogranh, ogranw;
					if (img.width>img.height) {
						pos = "horizontal-img";
					}
					if (img.height>=img.width) {
						pos = "vertical-img";
					}
						// Этот кусок кода приводит изображение к валидному размеру
					ogranW = img.width;
					ogranH = img.height;
					maxW = 720;
					maxH = 512;
					while (ogranW>maxW || ogranH>maxH) {
						if (ogranW>maxW) {
							ogranW = maxW;
							koff = img.width/ogranW;
							ogranH = img.height/koff;
						}
						if (ogranH>maxH) {
							ogranH = maxH;
							koff = img.height/ogranH;
							ogranW = img.width/koff;
						}
					}
					// Выравниваем фотку вертикально по центру, если это нужно
					var top = "";
					var height = "";
					if (ogranH<maxH) {
						top = Math.round((512-ogranH)/2);
						height = 512 - top;
						top = top+"px";
					}
					$(".photo-watch-name").val(photo.name);
					$(".photo-description").val(photo.description);
					// Обрабатываем дату
						var dt = new Date(photo.created);
						created = ((dt.getDate()<10)?('0'+dt.getDate()):(dt.getDate())) + "." 
						+ ((dt.getMonth()<10)?('0'+(dt.getMonth()+1)):(dt.getMonth()+1)) + "." + dt.getFullYear();
					$(".photo-watch-data").html("Добавлено: " + created);
					$(".photo-container").css("padding-top", top);
					$(".photo-container").css("height", height);
					$(".photo-container").html("<img src='"+img.src+"' class='photo-watch-img "+pos+"' style='width: "+ogranW+"px; height: "+ogranH+"px;'>");
					$(".index-of-photo-now").html(parseInt($(".photo-now").val())+1);
					$(".delete-this-photo").attr("num", $(".photo-now").val());
				};
				img.src = photo.path;
			},
			error: function (err) {
				alert("Ошибка загрузки фотографии");
				// Нужно сделать какое-нибудь красивое окошко и нормально объяснить
				// Из-за чего возникла ошибка
			}
		});
	}	 
	//Функции прокрутки фотографий
	function photo_slider (type) {
		index_now = parseInt($(".photo-now").val());
		all = parseInt($(".photo-now").attr("all"));
		// Убедимся, что открыто окно просмотра фотографий
		if ($(".photo-watch-centr").css("display")=='block') {
			if (type=='next') {
				if (index_now<(all-1)) {
					$(".photo-now").val(index_now+1);
					loadPhoto();
				}
			}
			if (type=='back') {
				if (index_now>0) {
					$(".photo-now").val(index_now-1);
					loadPhoto();
				}
			}		
		}	
	}
	//Функций закрытия окно просмотра фотографии
	function open_photo_view () {
		$(".whiteout").show();
		$(".photo-watch-centr").css("top", (parseInt($("body").scrollTop())+10)+"px");
		$(".photo-watch-centr").show();
	}
	function close_photo_view () {
		$(".photo-watch-centr").hide();
		$(".whiteout").hide();
	}

	//Обработка кнопки "Удалить"
		// Наведение-удаление указателя мышки
		$(".album-delete").hover( function () {
			$(this).find("img").attr("src", "../img/album-delete-button-hover.png");
		}, function () {
			$(this).find("img").attr("src", "../img/album-delete-button.png");
		});

		//Нажатие на кнопку
		$(".album-delete").click( function () {
			var koord = $(this).offset();
				var x = koord.left - 231;
				var y = koord.top + 47;
			$("#id-delete-album").val($(this).attr("for"));
			$(".album-delete-attention-window").css({left: Math.round(x), top: Math.round(y)});
			$(".album-delete-attention-window").show(200);
		});
		//Обработка кнопок ДА-НЕТ
		$(".album-link-hover").hover( function () {
			$(this).addClass("album-link-hover-yes");
		}, function () {
			$(this).removeClass("album-link-hover-yes");
		});

		//Скрытие окна предупреждения по клику "НЕТ"
		$(".close-delete-attention").click( function () {
			$(".album-delete-attention-window").hide(300);
		});

		//Пользователь согласился удалить альбом
		$(".yes-delete-attention").click( function () {
			$.ajax({
				url: "/album/deleteAlb",
				method: "POST",
				data: {
					id_alb: $("#id-delete-album").val()
				},
				success: function (res) {
					$(".album-delete-attention-window").hide(300);
					$("#"+$("#id-delete-album").val()).hide(150);
				},
				error: function (err) {
					alert(err);
				}
			});
		});

		// Окно создания фотоальбома. Обработка событий связанных с этим окном и созданием фотоальбома
			$("body").on("click", ".create-album-button", function () {
				$(".window-of-create-photoalbum").show(200);
			});
			$("body").on("click", ".window-of-create-photoalbum-close", function () {
				$(".window-of-create-photoalbum").hide(200);
			});

			// Загрузка фотографий при создании альбома
				$("body").on("change", ".photo-in-album-input", function () {
					$(".info-about-load").html("Прогресс загрузки: ");
					$("#form-photoUpload").ajaxSubmit({
						success: function (res) {
							if (res.err) {
								$(".info-about-load").html("Ошибка загрузки фотографии");
								$(".upload-progress").html(" ");
							}
							if (res.photo) {
								$(".info-about-load").html("Загрузить фото");
								$(".upload-progress").html(" ");
								$(".label-add-photo").after("<img src='"+res.photo.prevPath+"' class='loaded-photo'>");
							}
						},
						error: function (err) {
							$(".upload-progress").html(" ");
							$(".info-about-load").html("Ошибка загрузки фотографии");
							alert(err);
						},
						uploadProgress: function (ev, pos, total, percent) {
							$(".upload-progress").html(percent+"%");
						}
					});
				});
			// Отмена создания альбома
				/* Все загруженные фотографии нужно из базы и из папки удалить и закрыть окно */
				$("body").on("click", ".create-album-cancel", function () {
					$(".window-of-create-photoalbum").hide(200);
					$(".added-photo-container").html("<label class='label-add-photo'></label>");
					$.ajax({
						method: "POST",
						url: "/album/deleteNoAlb",
						data: null,
						success: function (res) {
						},
						error: function (err) {
							alert(err);
						}
					});
				});
			// Создание альбома
				$("body").on("click", ".create-album-submit", function () {
					$.ajax({
						method: "POST",
						url: "/album/createAlb",
						data: {
							name: $(".name-of-album").val(),
							// description: $(".description-of-album").val(),
							user: $(".user-id-information").val()
						},
						success: function (res) {
							window.location.reload(true);
						},
						error: function (err) {
							alert(err);
						}
					});
				});
	// ------------------------------------------------------------

	// Открытие окна просмотра изображений крупным планом
			// Слайдер фотографий
				//По нажатию "ВПеред" или по нажатию на фотку или по нажатию на стрелку мыши
				// , мы загружаем следующую фотографию 
					$("body").on("click", ".next-photo", function () {photo_slider('next');});
					$("body").on("click", ".photo-watch-img", function () {photo_slider('next');});
					$(document).keydown(function (eventObject) {
						if (eventObject.which==39) photo_slider('next');
						if (eventObject.which==37) photo_slider('back');
						if (eventObject.which==27) close_photo_view();
					});
				//По нажатию "Назад", мы загружаем предыдущую фотографию
				$("body").on("click", ".before-photo", function () {
					photo_slider('back');
				});


			$("body").on("click", ".album-window-img-blank", function (){
				$(".photo-now").val($(this).attr("num"));
				open_photo_view();
				loadPhoto();
			});

			//Инициация изменений
			$("body").on("click", ".edit-this-photo", function () {
				$(".photo-watch-name").removeAttr("readonly");
				$(".photo-description").removeAttr("readonly");
				$(this).hide();
				$(".save-this-photo").show();
			});
			//Сохранение изменений
				$("body").on("click", ".save-this-photo", function () {
					$(".photo-watch-name").attr("readonly",'');
					$(".photo-description").attr("readonly",'');
					$(".edit-this-photo").show();
					$(this).hide();


					var path = $(".photo-watch-img").attr("src");
					var arr = path.split("/");
					path = "/" + arr[arr.length-2] + "/" + arr[arr.length-1];
					$.ajax({
						method: "POST",
						url: "/album/savephoto",
						data: {
							name: $(".photo-watch-name").val(),
							description: $(".photo-description").val(),
							path: path,
						},
						success: function (res) {
						},
						error: function (err) {
							alert(err);
						}
					})
				});
			//Удаление фотографии
				$("body").on("click", ".delete-this-photo", function () {
					var path = $(".photo-watch-img").attr("src");
					var arr = path.split("/");
					path = "/" + arr[arr.length-2] + "/" + arr[arr.length-1];
					var element = $(this);
					
					$.ajax({
						method: "POST",
						url: "/album/photo_ajax",
						data: {
							path: path,
							type: "delete"
						},
						success: function (res) {
							close_photo_view();
							$(".photo-now").attr("all", parseInt($(".photo-now").attr("all")-1));
							$(".photoCount").html( $(".photoCount").html()-1 );
							$(".numPhoto_"+element.attr("num")).hide(100);
						},
						error: function (err) {
							alert(err);
						}
					});
				});

			//Закрытие окна
			$(".close-photo-watch").click(function () {
				close_photo_view();
			});
		//---------------------------------------------------------------

			// Загрузка новых фотографий в фотоальбом
				$("body").on("change", ".photo-in-album-input-bl", function () {
					$("#form-photoUpload").ajaxSubmit({
						success: function (res) {
							$(".progress-load").html(" ");
							if (res.err) {
								alert("Ошибка загрузки фотографии", err);
							}
							if (res.photo) {
								dopClass = "";
								if ( ( parseInt($(".photo-now").attr("all"))+1 )%5 == 0 ) {
									dopClass = "right-img-album"
								}
								$(".place-for-add-photo").before("<img src='"+res.photo.prevPath+"' class='album-window-img-blank numPhoto_"+$(".photo-now").attr('all')+"' num='"+$(".photo-now").attr("all")+"'>");
								$(".photo-now").attr("all", ( parseInt( $(".photo-now").attr('all') ) + 1 ));
								$(".photoCount").html( parseInt( $(".photoCount").html() ) + 1);
								$(".photo-now").before("<input type='hidden' class='src-of-num-"+($(".photo-now").attr("all")-1)+"' value='"+res.photo.prevPath+"'>");
							}
						},
						error: function (err) {
							$(".progress-load").html(" ");
							alert(err);
						},
						uploadProgress: function (ev, pos, total, percent) {
							$(".progress-load").html("Загрузка файла: "+percent);
						}
					});
				});
	// увеличиваем фотку
	$(".photo-line-img").mouseover(function () {
		$(".photo-line-img").css("z-index", 0);
		$(this).css("z-index", 100);
	});
	// // уменьшаем фотку
	// $(".photo-line-img").mouseleave(function () {
	// 	$(this).css("z-index", 0);
	// });

	// При нажатии на фотографию открывается альбом и всплывающее окно фотки
	$(".photo-line-img").click(function () {
	});

	// Изменение названия альбома
		$(".edit-name-of-album").click(function () {
			$(this).hide();
			$(".save-edit-name").css('display', 'inline-block');
			$(".stext").hide();
			$(".input-for-edit-name-of-album").css('display', 'inline-block');
		});
		$(".save-edit-name").click( function () {
			$(this).hide();
			$(".input-for-edit-name-of-album").hide();
			$('.stext').css('display', 'inline-block');
			$(".progress-save-edit-name").css('display', 'inline-block');
			$.ajax({
				url: "/album/savealb",
				method: "POST",
				data: {
					name: $(".input-for-edit-name-of-album").val(),
					id: $(".view-album-window-button").attr("for")
				},
				success: function (res) {
					if (!res.err) {
						$(".progress-save-edit-name").hide();
						$(".ok-of-save-edit-name").css('display', 'inline-block');
						$('.stext').html($(".input-for-edit-name-of-album").val());
						setTimeout( function () {
							$(".ok-of-save-edit-name").hide();
							$(".edit-name-of-album").css('display', 'inline-block');
						}, 700);
					} else {
						$(".progress-save-edit-name").hide();
						$("edit-name-of-album").css('display', 'inline-block');
						alert(err);
					}
				},
				error: function (err) {
					$(".progress-save-edit-name").hide();
					$("edit-name-of-album").css('display', 'inline-block');				
					alert(err);
				}
			});
		});
});
