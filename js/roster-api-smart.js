
/**
 * roster-api-smart.js
 * Copyright (c) 2016 kengo92i
 */
(function () {

    "use strict";

    /**
     * Googleドキュメントから勤務表データを取得し表示する
     */
    (function () {
        displayNowLoading();

        $.ajax({
            type : 'GET',
            url : 'https://spreadsheets.google.com/feeds/cells/1N1mb2ZuiZJRFpHIOdMm_0RPhPcHHDCsl7cWdHZaxXwU/od6/public/values?alt=json',
            dataType : 'jsonp',
            cache : false,
            success : function (data) {
                var sheetsEntry = data.feed.entry;
                var roster = formatSheetsEntry(sheetsEntry);
                render(roster);
            },
            error : function (error) {
                console.log(error);
            },
            complete : function (data) {
                removeNowLoading();
            }
        });
    }());

    /**
     * Googleドキュメントから取得した勤務表データを扱える形に整形する
     * @param {Object} sheetsEntry 勤務表データのJSON
     * @return {Object} 整形された勤務表
     */
    function formatSheetsEntry(sheetsEntry) {
        var roster = [];
        var prev_row = 0, roster_row = 0;
        for (var nth = 0; nth < sheetsEntry.length; ++nth) {
            var current_col = sheetsEntry[nth].gs$cell.col;
            var current_row = sheetsEntry[nth].gs$cell.row;
            var cell = sheetsEntry[nth].gs$cell.$t;
            if (prev_row != current_row) {
                prev_row = current_row;
                roster_row += 1;
                roster.push([]);
            }
            roster[roster_row-1].push(cell);
        } 
        return roster; 
    }

    /**
     * お知らせを追加する
     * 一度も実行されていない場合はお知らせが表示されない
     * @param {Object} row 勤務表の行データ
     */
    function addInformation(row) {
        $('#information').append('<tr><td>' + row[1] + '</td><td colspan="6">' + row[2] + '</td></tr>');
        $('#information-wrapper').show();
    }

    /**
     * 勤務表のための行データを作成する
     */
    function generateRoster(row) {
        var options = ['期間', '勤務時間', '備考', 'お知らせ'];
        var tr = '';

        if ($.inArray(row[0], options) >= 0) { // オプションに対する処理
            tr = '<tr>';
            if (row[0] == '期間') {
                $('#roster-period').append(row[1]);
                return null;
            }
            else if (row[0] == '勤務時間') {
                tr = '<tr><td colspan="7" style="font-size: 1.5em;">' + row[1] + '</td></tr>'; 
            }
            else if (row[0] == 'お知らせ') {
                addInformation(row);
                return null;
            } else {
                tr = '<tr><td colspan="7">' + row[1] + '</td></tr>'; 
            }
        } else { // 勤務情報は表示しない
            return null;
        }

        return tr;
    }

    /**
     * 勤務表を表示する
     * @param {Object} 勤務表データ
     */
    function render(roster) {
        var target = $('#roster');
        for (var row = 0; row < roster.length; ++row) {
            var tr = generateRoster(roster[row]);
            if (tr != null) {
                target.append(tr);
            }
        }
    }

    /**
     * ローディング表示
     */
    function displayNowLoading() {
        var message = '<div class="loading-message">データを取得中...</div>';

        if ($('#loading-area').val() == "") {
            $('#loading-area').append('<div id="loading">' + message + '</div>');
        }
    }

    /**
     * ローディングを非表示にする
     */
    function removeNowLoading() {
        $('#loading').remove();
    }

}());