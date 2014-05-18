$(function () {
	$('.add-new-event').click( function () {
		$('.around-create-event-window').fadeIn(100);
	})
	$('.cancel-create-event').click( function () {
		$('.around-create-event-window').find('input, textarea').val('')
		$('.around-create-event-window').fadeOut(100);
	})

	$('[for = photo]').click( function () {
		$('.load-event-photo-input').trigger('click');
	})
	$('[for = video]').click( function () {
		$('.load-event-video-input').trigger('click');
	});
	$('.load-event-photo-input').change( function () {
		$('#eventloadphoto').ajaxSubmit({
			success: function (res) {
				$('.eventphoto-add').before("<img src='"+res.prevPath+"'>");
				setTimeout( function () {
					$('.uploadprogressphoto').html('');
				}, 400);
			},
			error: function (err) {
				$('.uploadprogressphoto').html('Ошибка');
			},
			uploadProgress: function (ev, pos, total, percent) {
				$('.uploadprogressphoto').html(percent+'%');
			}
		});
	});
	$('.load-event-video-input').change( function () {
		$('#eventvideoload').ajaxSubmit({
			success: function (res) {
				$('.eventvideo-add').before("<img src='"+res.videoprev+"'>");
				setTimeout( function () {
					$('.uploadprogressvideo').html('');
				}, 400);
			},
			error: function (err) {
				$('.uploadprogressvideo').html('Ошибка');
			},
			uploadProgress: function (ev, pos, total, percent) {
				$('.uploadprogressvideo').html(percent+'%');
			}
		});		
	})

	$('.submit-create-event').click( function () {
		$('#CREATE_EVENT').submit();
	})
})