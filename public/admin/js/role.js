// Permissions
const tablePermissons = document.querySelector("[table-permissons]");
if (tablePermissons) {
    const buttonSubmit = document.querySelector("[button-submit]");
    buttonSubmit.addEventListener("click", () => {
        let permissions = [];
        const rows = tablePermissons.querySelectorAll("[data-name]");

        rows.forEach(row => {
            const name = row.getAttribute("data-name");
            const inputs = row.querySelectorAll("input");

            if(name == "id"){
                inputs.forEach(input => {
                    const id = input.value;
                    permissions.push({
                        id: id,
                        permissions: []
                    })
                })
            } else {
                inputs.forEach((input, index) => {
                    const checked = input.checked;
                    if(checked) {
                        permissions[index].permissions.push(name);
                    }
                })
            }
        });

        console.log(permissions);
        if(permissions.length > 0) {
            const formChangePermissons = document.querySelector("#form-change-permissions");
            const inputPermissions = formChangePermissons.querySelector("input[name='permissions']");
            inputPermissions.value = JSON.stringify(permissions);
            formChangePermissons.submit();
        }
    });
}

// End Permissions

// Permissions Data Default
const dataRecords = document.querySelector("[data-records]")
if(dataRecords) {
    const records = JSON.parse(dataRecords.getAttribute("data-records"));
    const tablePermissons = document.querySelector("[table-permissons]");

    records.forEach((record, index) => {
        const permissions = record.permissions;

        permissions.forEach(permission => {
            const row = tablePermissons.querySelector(`[data-name="${permission}"]`);
            const input = row.querySelectorAll("input")[index];

            input.checked = true;
        })
    })
}
// End Permissions Data Default