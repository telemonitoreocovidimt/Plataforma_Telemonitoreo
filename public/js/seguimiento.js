$(document).ready(() => {
  const fullRequired = (option = true) => {
    let lstInput = Array.from(
      document.getElementById('form-Seguimiento').querySelectorAll('input')
    );

    lstInput.map((input) => {
      if (option) {
        $(input).attr('required', 'required');
      } else {
        $(input).removeAttr('required');
      }
    });
  };

  const obtenerDatos = () => {
    let form = document.getElementById('form-Seguimiento');
    let lstResponse = Array.from(
      form.querySelectorAll('.item-question-option')
    );

    var valores = {};
    lstResponse.map((respose) => {
      let input = respose.querySelector(`input:checked`);
      valores[input.name] = input.value;
    });

    return valores;
  };

  $(`input[name='pregunta1']`).on('input', (e) => {
    let container = document.getElementById('question-option');
    let input = e.target;
    if (input.value == 'SI') {
      $(container).toggle(100);
      fullRequired();
    } else {
      $(container).hide(100);
      fullRequired(false);
    }
  });

  $('#form-Seguimiento').on('submit', (e) => {
    e.preventDefault();
    const pregunta1 = document.getElementById('pregunta1');
    const valor = pregunta1
        .querySelector(`input[name='pregunta1']:checked`).value;
    let objData = {};
    if (valor == 'SI') {
      objData = obtenerDatos();
      objData.estado = 'no estable';
    } else {
      for (let i = 1; i <= 10; i++) {
        objData[`pregunta${i}`] = 'NO';
      }
      objData.estado = 'estable';
    }
    const body = {
      'piel': objData.pregunta2.toUpperCase() == 'NO'? false: true,
      'dolor': objData.pregunta3.toUpperCase() == 'NO'? false: true,
      'fiebre': objData.pregunta4.toUpperCase() == 'NO'? false: true,
      'fatiga': objData.pregunta5.toUpperCase() == 'NO'? false: true,
      'cabeza': objData.pregunta6.toUpperCase() == 'NO'? false: true,
      'confusion': objData.pregunta7.toUpperCase() == 'NO'? false: true,
      'adormecimiento': objData.pregunta8.toUpperCase() == 'NO'? false: true,
      'diarrea': objData.pregunta9.toUpperCase() == 'NO'? false: true,
      'otros': objData.pregunta10.toUpperCase() == 'NO'? false: true,
    };
    $.ajax({
      'url': '/api/v1/ajax/vaccine/survey',
      'data': body,
      'method': 'POST',
      'beforeSend': function() {
        $('.loaderWeb').toggle();
      },
      'success': function(response) {
        if (response.status) {
          window.location.href = window.location.href + '/gracias';
        } else {
          $('#modal-error-custom-content').text(response.message);
          $('#modal-error-custom').modal('show');
        }
      },
      'error': function(response) {
        console.error('error : ', response);
        $('#modal-error').modal('show');
      },
    });
  });
});
