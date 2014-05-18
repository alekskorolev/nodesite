$(function () {
	// Показываем окошко редактирования при наведении на второстепенное видео
	$(".video-info-place,.main-video").hover( function () {
		$(this).find(".video-corner-panel").show();
	}, function () {
		$(this).find(".video-corner-panel").hide();
	});

	// Обработка события связанных с добавлением видео-файла
		// Показываем окно добавления видео-файла при нажатии на кнопку "добавить видео"
		$(".add-new-video").click( function () {
			$(".window-of-add-video").show();
		});
		// Закрываем окно 
		$(".window-of-add-video-close").click( function () {
			$(".window-of-add-video").hide();
		});

	// загрузка видюха на страницу
		$(".video-upload-input").change( function () {
			$("#form-vUpload").ajaxSubmit({
				success: function (res) {
					if (res.video) {
						$(".added-video-container").html("<div style='width: 100%; text-align: center; padding-top: 30px;'><img path='"+res.video.path+"' class='video-href' src='"+res.video.videoprev+"'></div>");
						$(".load-video-in-album").hide();
						$(".load-video-from-url").hide();
					}
				},
				error: function (err) {
					$(".info-about-load-video").html("Ошибка загрузки!");
				},
				uploadProgress: function (ev, pos, total, percent) {
					$(".info-about-load-video").html(percent+"%");
				}
			});
		});

	// При нажатии на отмену удаляется видео и запись видео
		$(".add-video-cancel").click( function () {
			$.ajax({
				url: "/valbum/deletenosaved",
				method: "POST",
				data: {
					user_id: $(".user_identificator").val()
				},
				success: function (res) {
					$(".window-of-add-video").hide();
					window.location.reload(true);
				},
				error: function (err) {
					alert("Error");
				}
			});
		});
	// При нажатии "сохранить" видео сохраняется в базе
		$(".add-video-submit").click(function () {
			if (!!$("img.video-href").attr('path')) {
				from = 'disk';
			} else {
				if ($(".url-for-upload-video").val()) {
					if (true) {
						from = 'internet';
					} else {
						alert("Неверный формат ссылки");
					}
				} else {
					alert("Загрузите видео с компьютера или добавьте ссылку!");
					return false;
				}
			}
			$.ajax({
				url: "/valbum/add_video",
				method: "POST",
				data: {
				 	type: "save",
				 	user_id: $(".user_identificator").val(),
				 	name: $(".name-of-album").val(),
				 	description: $(".description-of-album").val(),
				 	path: !!$("img.video-href").attr('path') ? $("img.video-href").attr("path") : $(".url-for-upload-video").val(),
				 	from: from
				},
				success: function (res) {
					if (res.err) {
						alert("Возникла ошибка: ", res.err);
					} else {
						window.location.reload(true);
					}
				},
				error: function (err) {
					alert(err);
				}
			});
		});
	// Пользователь шмякнул по кнопочке удаления видео
		$(".corner-panel-delete").click(function () {
			$.ajax({
				url: "/valbum/video_ajax",
				method: "POST",
				data: {
					type: 'delete',
					id: $(this).attr('for')
				},
				success: function (res) {
					window.location.reload(true);
				},
				error: function (err) {
					alert("Ошибка: ", err);
				}
			});
		});
	// Редактирование видео при нажатии на значок редактирования
		$('.corner-panel-edit').click( function () {
			// Определим див внутри которого должно произойти изменение
			var block = $(this).closest(".video-info-place, .main-video");
				block.find(".video-description-input, .video-name-input, .corner-panel-save").show();
				block.find(".video-name-span, .video-desc-span").hide();
		});

	// Сохранение изменений при нажатии на кнопку "сохранить"
		$(".corner-panel-save").click( function() {
			var block = $(this).closest(".video-info-place, .main-video");
				block.find(".video-description-input, .video-name-input, .corner-panel-save").hide();
				block.find(".video-name-span, .video-desc-span").show();

			$.ajax({
				url: "/valbum/video_ajax",
				method: "POST",
				data: {
					type: 'save',
					id: block.attr("id"),
					name: block.find(".video-name-input").val(),
					description: block.find(".video-description-input").val()
				},
				success: function (res) {
					block.find(".video-name-span").html(block.find(".video-name-input").val());
					block.find(".video-desc-span").html(block.find(".video-description-input").val());
					block.find(".saved-nesaved").html("Изменения сохранены!");
					setTimeout( function () {
						block.find(".saved-nesaved").html(" ");
					}, 777);
				},
				error: function (err) {
					block.find(".saved-nesaved").html("Ошибка");
					setTimeout( function () {
						block.find(".saved-nesaved").html(" ");
					}, 777);
				}
			});
		});
});