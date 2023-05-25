

var formConfig = {
  elements: [
    {
      label: "Name",
      type: "text",
      name: "name",
      min: 3, // Minimum value
      max: 20 // Maximum value
    },
    {
      label: "Email",
      type: "email",
      name: "email",
      id: "email"
    },
    {
      label: "Country",
      type: "select",
      name: "country",
      options: [
        { label: "USA", value: "usa" },
        { label: "Canada", value: "canada" },
        { label: "UK", value: "uk" }
      ]
    },
    {
      label: "Subscribe to newsletter",
      type: "checkbox",
      name: "newsletter"
    }
  ]
};


function generateForm(config) {
  var form = document.createElement("form");

  config.elements.forEach(function (element) {
    var label = document.createElement("label");
    label.textContent = element.label;

    var input;

    switch (element.type) {
      case "text":
      case "email":
        input = document.createElement("input");
        input.type = element.type;
        input.name = element.name;
        input.id = element.id;
        input.min = element.min; // Set min attribute if available
        input.max = element.max; // Set max attribute if available
        break;

      case "select":
        input = document.createElement("select");
        input.name = element.name;
        element.options.forEach(function (option) {
          var optionElement = document.createElement("option");
          optionElement.value = option.value;
          optionElement.textContent = option.label;
          input.appendChild(optionElement);
        });
        break;

      case "checkbox":
        input = document.createElement("input");
        input.type = element.type;
        input.name = element.name;
        break;
    }

    form.appendChild(label);
    form.appendChild(input);
  });

  return form;
}







var formContainer = document.getElementById("form-container");
var generatedForm = generateForm(formConfig);
formContainer.appendChild(generatedForm);


