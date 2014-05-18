function MEcalendar (el, options) {
		// Обрабатываем пришедшие данные
			//Если месяц больше 11 или меньше 0, то увеличиваем или уменьшаем год
			if (options.month>11) { 
				options.year = options.year + Math.ceil ( (options.month-11) / 12 );
				options.month = options.month % 12; 
			}
			if (options.month<0) { 
				options.year = options.year - Math.ceil ( ( Math.abs(options.month) / 12) );
				options.month = 12 - Math.abs( options.month % 11 );
			}


		function startDayOfMonth (year, month) { // Возвращает номер дня недели, с которого начинается месяц
			// date - месяц, у которого нужно найти день, с которого он начинается.
			// Сформируем дату, указывающую на первый день месяца
			if (!(month+1)) {
				month = new Date();
				month = month.getMonth();
			}
			if (!year) {
				year = new Date();
				year = year.getFullYear();
			}
			var start = new Date(year, month, 1);

			return start.getDay();
		}
		function getNameOfMonth(month) { // Функция возвращает имя текущего месяца на русском языке
			if (!(month+1)) {
				month = new Date();
				month = month.getMonth();
			}
			var monthsName = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь",
							"Ноябрь", "Декабрь"];
			return monthsName[month];
		}
		function finishDayOfMonth(year, month) {
			if (!year) {
				year = new Date();
				year = year.getFullYear();
			}
			if (!(month+1)) {
				month = new Date();
				month = month.getMonth();
			}
			month = month + 1;
			if (month>11) {
				month = 0;
				year = year + 1;
			}
			var nextMonth = new Date(year, month, 1);
			nextMonth = nextMonth - 1;
			nextMonth = new Date(nextMonth);
			return nextMonth.getDate();
		}

		// Опции заполнения календаря
			var small = ''; if (options.small) { small = "-small"; }
		// Получаем имя месяца
			monthName = getNameOfMonth(options.month);
		// Определяем, с какого дня недели начался месяц и каким числом он закончился
			var startDay = startDayOfMonth(options.year, options.month);
			var finishDay = finishDayOfMonth(options.year, options.month);

		if (options.type=='check-date') {
			dopinfo = 'year='+options.year+' month='+options.month+' style=cursor:pointer; ';
		} else {
			dopinfo = '';
		}

		// Формируем массив HTML кода
			var arr = [
 				"<div class='ME-calendar"+small+"'>", 
 					"<div class='monthName"+small+"'>",
 						"<span>"+monthName+", "+options.year+"</span>",
 					"</div>",
 					"<div class='placeDay"+small+"'>",
 						"<div class='nameWeek'>",
 							"<div class='li"+small+"'>Пн</div>",
 							"<div class='li"+small+"'>Вт</div>",
 							"<div class='li"+small+"'>Ср</div>",
 							"<div class='li"+small+"'>Чт</div>",
 							"<div class='li"+small+"'>Пт</div>",
 							"<div class='li"+small+"'>Сб</div>",
 							"<div class='li"+small+"'>Вс</div>",
 						"</div>",
 						"<div class='days'>",
 							"<div class='ul'>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 							"</div>",
  							"<div class='ul'>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 							"</div>",
  							"<div class='ul'>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 							"</div>",
  							"<div class='ul'>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 							"</div>",
  							"<div class='ul'>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 							"</div>",
   							"<div class='ul'>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 								"<div class='li"+small+"'></div>",
 							"</div>",
 						"</div>",
 					"</div>",
 				"</div>",
			];

		var iterator = false, hasDays = false, iteratorNum = 1, weekNum = 1;
		for (var i=0; i<arr.length; i++) {
			var elm = arr[i]; // Выносим элемент в отдельную переменную для удобства

			// Фиксируем момент, когда начались ячейки days
				if ( (elm.indexOf("days")+1) ) {
					hasDays = true;
				}
				if ( hasDays&&!iterator&&(weekNum==startDay) ) {
					iterator = true;
				}
				if (iterator&&iteratorNum>finishDay) {
					iterator = false;
					hasDays = false;
				}

			// Если пробегаемся по массиву DAYS, то рисуем в ячейки текущее число
				if (iterator&&(elm.indexOf("li")+1)) {
					var elmArr = elm.split(">");
					graa = elmArr[0].split('li');
					graa[0] = graa[0] + 'dopinfo ';
					elmArr[0] = graa.join('li');
					elmArr[0] += ' '+dopinfo+' ';
					elmArr[1] = iteratorNum++ + elmArr[1];
					var elm = elmArr.join(">");
				}
			// Если передан массив с событиями, то отмечаем те дни, у которых есть дни
				if (iterator&&options.acts&&(elm.indexOf("li")+1) ) {
					if (options.acts[iteratorNum-1]) {
						var elmArr = elm.split("'");
						elmArr[1] = elmArr[1] + " act";
						elm = elmArr.join("'");
						elm = "<span class='links'" + 
						" year='"+options.year+"' month='"+options.month+"' day='"+(iteratorNum-1)+"' " +
						" disabled href='/activity?year="+options.year+"&month="+options.month+"&day="+(iteratorNum-1)+"'>" + elm + "</span>";
					}
				}

			// Увеличиваем значение недели
				if (hasDays&&(elm.indexOf("li")+1) ) {
					weekNum++;
					if (weekNum>6) {
						weekNum = 0;
					}
				}
			arr[i] = elm;
		}

		// Формируем HTML код в строчку и рисуем в переданный контейнер календарь
		text = arr.join("");
		$(el).html(text);
	};