var app = angular.module('myapp', ['ui.router', 'ngStorage']);
//路由设置
app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('index', {
        url: '/index',
        templateUrl: './views/index.html',
    }).state('index.lists', {
        url: '/:tab',
        templateUrl: './views/index_list.html',
        controller: 'indexListsCtrl'
    }).state('my', {
        url: '/my',
        templateUrl: './views/my.html',
        controller: 'myCtrl'
    }).state('details', {
        url: '/details/:id',
        templateUrl: './views/details.html',
        controller: 'detailsCtrl'
    });
    //$urlRouterProvider.when('','/headlines/1')
    $urlRouterProvider.otherwise('/index/all');
}]);

//首页列表控制器
app.controller('indexListsCtrl', ['$scope', '$http', '$stateParams', '$sessionStorage',function($scope, $http, $stateParams, $sessionStorage) {
    $scope.data = [];
    $scope.page = 1;
    $scope.limit = 10;
    $scope.loading = true;
    var more = function() {
        $http.get('https://cnodejs.org/api/v1/topics', {
            params: {
                tab: $stateParams.tab,
                page: $scope.page,
                limit: $scope.limit,
                mdrender: false
            }
        }).success(function(data) {
            $scope.data = $scope.data.concat(data.data);
            $sessionStorage[$stateParams.tab] = $scope.data;
            $sessionStorage[$stateParams.tab + 'page'] = $scope.page;
            $scope.loading = false;
        })
    }
    if ($sessionStorage[$stateParams.tab]) {
        $scope.data = $sessionStorage[$stateParams.tab];
        $scope.page = $sessionStorage[$stateParams.tab + 'page'];
        $scope.loading = false;
    } else {
        more();
    }
    $scope.loadMore = function() {
        $scope.page += 1;
        $scope.loading = true;
        more();
    }
    $scope.onReload = function() {
      console.warn('reload');
      var deferred = $q.defer();
      setTimeout(function() {
        deferred.resolve(true);
      }, 1000);
      return deferred.promise;
    };

}]);
//顶部导航控制器
app.controller('footnavCtrl', ['$scope', function($scope) {

}]);

//我的页面控制器
app.controller('myCtrl', ['$scope', 'histoty', function($scope, histoty) {
    $scope.goback = histoty.goback;
}]);

//详情页控制器
app.controller('detailsCtrl', ['$scope', '$http', '$sce', '$state', 'histoty', '$sessionStorage', function($scope, $http, $sce, $state, histoty, $sessionStorage) {
    $scope.data = [];
    $scope.loading = true;
    if ($sessionStorage[$state.params.id]) {
        $scope.data = $sessionStorage[$state.params.id];
        var reg = new RegExp('src="//','ig');
        $scope.content = $scope.data.content.replace(reg,'src="http://');
        $scope.replies = $scope.data.replies;
        $scope.loading = false;
    } else {
        $http.get('https://cnodejs.org/api/v1/topic/' + $state.params.id).success(function(data) {
            $scope.data = data.data;
            console.log(data)
            var reg = new RegExp('src="//','ig');
            $scope.content = $scope.data.content.replace(reg,'src="http://');
            $scope.replies = $scope.data.replies;
            $sessionStorage[$state.params.id] = $scope.data;
            $scope.loading = false;
        })
    }

    $scope.goback = histoty.goback;

}]);

// 判断当前页面地址来触发顶部导航状态
app.directive('autofocus', ['$location', function($location) {
    return {
        link: function(scope, ele, arrt) {
            scope.$location = $location;
            scope.$watch('$location.path()', function(now) {
                var aLink = ele.children().attr('href');
                var type = aLink.replace('#', '');
                if (now.indexOf(type) != -1) {
                    // 访问的是当前链接
                    ele.parent().children().removeClass('active');
                    ele.addClass('active');
                }
            })
        }
    }
}]);
// 判断当前页面地址来触发底部按钮状态
app.directive('navfocus', ['$location', function($location) {
    return {
        link: function(scope, ele, arrt) {
            scope.$location = $location;
            scope.$watch('$location.path()', function(now) {
                if (now.indexOf('index') > 0 || now.indexOf('details') > 0) {
                    // 访问的是当前链接
                    ele.parent().children().removeClass('active');
                    ele.addClass('active');
                }
            })
        }
    }
}]);

//时间差过滤器
app.filter('timeDiff', function() {
    return function(input) {
        //JavaScript函数：
        var minute = 1000 * 60;  //与毫秒数转换
        var hour = minute * 60;  //与毫秒数转换
        var day = hour * 24;    //与毫秒数转换
        var halfamonth = day * 15;  // 输出半个月
        var month = day * 30;   //输出一个月
        var dateTimeStamp = new Date(input).getTime();  //api接收数据时间
        var now = new Date().getTime();  //现在时间
        var diffValue = now - dateTimeStamp;  // 时间差
        if (diffValue < 0) {
            return input;
        }
        var monthC = diffValue / month;  //月
        var weekC = diffValue / (7 * day);  //周
        var dayC = diffValue / day;  //天
        var hourC = diffValue / hour;  //小时
        var minC = diffValue / minute;  // 分钟
        if (monthC >= 1) {
            result = parseInt(monthC) + "个月前";
        } else if (weekC >= 1) {
            result = parseInt(weekC) + "周前";
        } else if (dayC >= 1) {
            result = parseInt(dayC) + "天前";
        } else if (hourC >= 1) {
            result = parseInt(hourC) + "个小时前";
        } else if (minC >= 1) {
            result = parseInt(minC) + "分钟前";
        } else {
            result = "刚刚发布";
        }
        return result;
    }
});
app.filter('sceurl', ['$sce', function($sce) {
    return function(input) {
        return $sce.trustAsHtml(input);
    }
}]);
//类型判断过滤器
app.filter('type', function() {
    return function(input) {
        var result = '';
        if (input == 'share') {
            result = '分享';
        } else if (input == 'ask') {
            result = '问答';
        } else if (input == 'job') {
            result = '招聘';
        } else {
            result = '精华';
        }
        return result;
    }
});
//返回上一步服务
app.service('histoty', ['$window', function($window) {
    this.goback = function() {
        $window.history.back();
    }
}])