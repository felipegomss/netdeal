var app = angular.module("myApp", []);

app.directive("treeView", function () {
  return {
    restrict: "E",
    replace: true,
    scope: {
      items: "=",
    },
    templateUrl: "app/templates/tree-view.html",
    controller: function ($scope) {
      $scope.toggleChildrenVisibility = function (item) {
        item.collapsed = !item.collapsed;
      };

      // Inicialize os itens se estiverem vazios
      if (!$scope.items) {
        $scope.items = [];
      }

      // Função para gerar IDs únicos
      function generateUniqueId() {
        return "_" + Math.random().toString(36).substr(2, 9);
      }

      // Função para cascatear estados de checkboxes
      $scope.toggleCheck = function (item) {
        toggleChildrenCheck(item, item.checked);
        updateParentCheck(item);
        saveItemsToLocalStorage();
      };

      function toggleChildrenCheck(parentItem, state) {
        angular.forEach(parentItem.children, function (child) {
          child.checked = state;
          toggleChildrenCheck(child, state);
        });
      }

      function updateParentCheck(item) {
        var parent = getParentItem(item);
        var processedParents = {}; // Usamos um objeto para rastrear os itens pai processados

        while (parent && !processedParents[parent.id]) {
          var allChildrenChecked = parent.children.every(function (child) {
            return child.checked;
          });
          var someChildrenChecked = parent.children.some(function (child) {
            return child.checked;
          });

          if (allChildrenChecked) {
            parent.checked = true;
          } else if (someChildrenChecked) {
            parent.checked = false;
          } else {
            parent.checked = false;
          }

          processedParents[parent.id] = true; // Marcar o pai como processado
          parent = getParentItem(parent); // Ir para o próximo pai
        }
      }

      // Função para adicionar um novo item filho
      $scope.addChild = function (parentItem) {
        var newItemName = prompt("Digite o nome do novo filho:");
        if (newItemName) {
          var newChild = {
            id: generateUniqueId(),
            name: newItemName,
            children: [],
            checked: false,
            deleteItem: $scope.deleteItem,
            updateItem: $scope.updateItem,
          };
          parentItem.children.push(newChild);
          saveItemsToLocalStorage();
        }
      };

      // Função para excluir um item
      $scope.deleteItem = function (itemToDelete) {
        console.log("Tentativa de excluir item: ", itemToDelete.name);

        if (confirm("Tem certeza de que deseja excluir este item?")) {
          var indexToRemove;

          if (itemToDelete.parent) {
            // Se o item tem um pai, encontre o índice no array de filhos do pai
            indexToRemove = itemToDelete.parent.children.indexOf(itemToDelete);
            if (indexToRemove !== -1) {
              itemToDelete.parent.children.splice(indexToRemove, 1);
              console.log("Item excluído com sucesso!");
            }
          } else {
            // Se o item não tem pai, é um item raiz
            indexToRemove = $scope.items.indexOf(itemToDelete);
            if (indexToRemove !== -1) {
              $scope.items.splice(indexToRemove, 1);
              console.log("Item excluído com sucesso!");
            }
          }
          saveItemsToLocalStorage(); // Salve os dados após a exclusão
        } else {
          console.log("Exclusão cancelada.");
        }
      };

      // Função para atualizar o nome de um item
      $scope.updateItem = function (itemToUpdate) {
        var updatedName = prompt(
          "Digite o novo nome para o item:",
          itemToUpdate.name
        );
        if (updatedName !== null) {
          itemToUpdate.name = updatedName;
          saveItemsToLocalStorage();
        }
      };

      // Função para salvar os itens no Local Storage
      function saveItemsToLocalStorage() {
        localStorage.setItem("treeItems", JSON.stringify($scope.items));
      }

      function getParentItem(item) {
        for (var i = 0; i < $scope.items.length; i++) {
          var parent = findParent($scope.items[i], item);
          if (parent) {
            return parent;
          }
        }
        return null;
      }

      function findParent(currentItem, itemToFind) {
        if (currentItem === itemToFind) {
          return currentItem;
        }
        for (var i = 0; i < currentItem.children.length; i++) {
          var found = findParent(currentItem.children[i], itemToFind);
          if (found) {
            return found;
          }
        }
        return null;
      }
    },
  };
});

app.controller("TreeController", function ($scope) {
  // Função para recuperar os dados do Local Storage
  function getStoredItems() {
    var storedItems = localStorage.getItem("treeItems");
    return storedItems ? JSON.parse(storedItems) : [];
  }

  // Inicialize os itens da árvore a partir do Local Storage ou crie um novo conjunto de itens
  $scope.items = getStoredItems();

  // Função para adicionar um novo item raiz
  $scope.addRootItem = function () {
    var newItemName = prompt("Digite o nome do novo item raiz:");
    if (newItemName) {
      var newRootItem = {
        id: generateUniqueId(),
        name: newItemName,
        children: [],
        checked: false,
        deleteItem: $scope.deleteItem,
        updateItem: $scope.updateItem,
      };
      $scope.items.push(newRootItem);
      saveItemsToLocalStorage();
    }
  };

  // Função para salvar os itens no Local Storage
  function saveItemsToLocalStorage() {
    localStorage.setItem("treeItems", JSON.stringify($scope.items));
  }

  // Função para Gerar ID
  function generateUniqueId() {
    return "_" + Math.random().toString(36).substr(2, 9);
  }
});
