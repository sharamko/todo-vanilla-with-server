(() => {
  const creatNotesTitle = (title) => {
    const appTitle = document.createElement('h2');
    appTitle.classList.add('text-center', 'mb-5');
    appTitle.innerHTML = title;
    return appTitle;
  };
  const creatNotesForm = () => {
    const form = document.createElement('form');
    const input = document.createElement('input');
    const btn = document.createElement('button');

    form.classList.add('input-group', 'mb-3');
    input.classList.add('form-control');
    input.placeholder = 'Введите название нового дела';
    btn.classList.add('btn', 'btn-primary');
    btn.setAttribute('disabled', 'disabled');
    btn.textContent = 'Добавить дело';

    input.addEventListener('input', () => {
      if (input.value.trim() === '') {
        btn.setAttribute('disabled', 'disabled');
      } else {
        btn.removeAttribute('disabled');
      }
    });

    form.append(input);
    form.append(btn);

    return {
      form,
      input,
      btn,
    };
  };
  const creatNotesList = (todoLength) => {
    const list = document.createElement('ul');
    const noList = document.createElement('p');
    list.classList.add('list-group');
    noList.classList.add('text-center');
    noList.textContent = 'Дел пока нет.';
    if (todoLength.length === 0) {
      list.append(noList);
    }

    return {
      list,
      noList,
    };
  };
  const creatNotesItem = (appItem, { onDone, onDelete }) => {
    const doneClass = 'list-group-item-success';
    const item = document.createElement('li');
    const buttonGroup = document.createElement('div');
    const doneBtn = document.createElement('button');
    const delBtn = document.createElement('button');
    item.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-center'
    );
    item.textContent = appItem.name;
    buttonGroup.classList.add('btn-group', 'btn-group-sm');
    doneBtn.classList.add('btn', 'btn-success');
    doneBtn.textContent = 'Готово';
    delBtn.classList.add('btn', 'btn-danger');
    delBtn.textContent = 'Удалить';
    buttonGroup.append(doneBtn);
    buttonGroup.append(delBtn);
    item.append(buttonGroup);

    doneBtn.addEventListener('click', () => {
      onDone({ appItem, element: item });
      item.classList.toggle(doneClass, appItem.done);
    });

    delBtn.addEventListener('click', () => {
      onDelete({ appItem, element: item });
    });

    if (appItem.done === true) {
      item.classList.add(doneClass);
    }

    return item;
  };
  const creatApp = async (container, title, owner) => {
    const response = await fetch(
      `http://localhost:3000/api/todos?owner=${owner}`
    );
    const todoItemList = await response.json();

    const appTitle = creatNotesTitle(title);
    const appForm = creatNotesForm();
    const appList = creatNotesList(todoItemList);
    const handlers = {
      onDone({ appItem }) {
        appItem.done = !appItem.done;
        fetch(`http://localhost:3000/api/todos/${appItem.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ done: appItem.done }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
      },
      onDelete({ appItem, element }) {
        if (!confirm('Вы уверены?')) {
          return;
        }
        element.remove();
        fetch(`http://localhost:3000/api/todos/${appItem.id}`, {
          method: 'DELETE',
        });
      },
    };

    container.append(appTitle);
    container.append(appForm.form);
    container.append(appList.list);

    todoItemList.forEach((todoItem) => {
      const todoItemElem = creatNotesItem(todoItem, handlers);
      appList.list.append(todoItemElem);
    });

    appForm.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!appForm.input.value) {
        return;
      }

      const response = await fetch('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify({
          name: appForm.input.value.trim(),
          owner,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const appItem = await response.json();

      const appItemElem = creatNotesItem(appItem, handlers);
    });
  };
  window.creatApp = creatApp;
})();
