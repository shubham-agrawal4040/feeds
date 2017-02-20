var mainApp = angular.module("mainApp", []);


mainApp.config(function($sceProvider) {
  // Completely disable SCE.  For demonstration purposes only!
  // Do not use in new projects.
  $sceProvider.enabled(false);
});

mainApp.controller("homeController", function($scope, postService, $timeout) {
    $scope.isLoading = true;
    $scope.loadMore = false;
    $scope.pageSize = 10;
    $scope.favorites = {};
    var favorites = localStorage.getItem("favorites");
    if(favorites) {
        $scope.favorites = JSON.parse(favorites);
    }
    
	postService.getPosts().then(
        function(response) {
            $scope.posts = response.posts.row;
            $scope.filterPosts();
            $scope.isLoading = false;
        },
        function(response) {
            console.log(response);
            $scope.isLoading = false;
        }
    );
    
    $scope.toggleFavorite = function(post) {
        post._IsFav = !post._IsFav;
        if($scope.favorites[post._Id]) {
            $scope.favorites[post._Id] = false;
            --post._FavoriteCount;
        } else {
            $scope.favorites[post._Id] = true;
            post._FavoriteCount = (post._FavoriteCount) ? (++post._FavoriteCount) : 1;
        }
        var favorites = JSON.stringify($scope.favorites);
        localStorage.setItem("favorites", favorites);
    };
    
    $scope.loadMorePosts = function() {
        $scope.isLoading = true;
        $scope.loadMore = false;
        $timeout(function() {
            $scope.numOfRecordsVisible += $scope.pageSize;
            if($scope.mainPosts.length <= $scope.numOfRecordsVisible) {
                $scope.loadMore = false;
            } else {
                $scope.loadMore = true;
            }
            $scope.isLoading = false;
        }, 500);
    };
    
    $scope.filterPosts = function() {
        $scope.mainPosts = [];
        $scope.answerPosts = [];
        for(index in $scope.posts) {
            var post = $scope.posts[index];
            if(post._PostTypeId == 1) {
                post._IsFav = $scope.favorites[post._Id] || false;
                if(post._IsFav) {
                    post._FavoriteCount = (post._FavoriteCount) ? (++post._FavoriteCount) : 1;
                }
                $scope.mainPosts.push(post);
            } else if(post._PostTypeId == 2) {
                $scope.answerPosts.push(post);
            }
        }
        $scope.numOfRecordsVisible = $scope.pageSize;
        if($scope.mainPosts.length > $scope.numOfRecordsVisible) {
            $scope.loadMore = true;
        }
    }
});

mainApp.factory('postService', function($http, $q) {
    var post = {};

    post.getPosts = function() {
        /*$http({
            url: '/data/posts,json',
            dataType: 'json',
            method: 'GET'
        }).success(function(response) {
            console.log(response);
        }).error(function(error) {
            console.log(response);
        });*/
        var deferred = $q.defer();
        var request = {
            method: "GET",
            url: "/data/posts.json"
        };
        //Call the server side api and return the result
        $http(request).then(function (response) { deferred.resolve(response.data); }, function (error) { deferred.reject(error.data.message); });
        return deferred.promise;
    }

    return post;
});
