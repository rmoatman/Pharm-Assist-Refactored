import React from 'react'

export default function medTable(props) {

    // const handleDeleteMed = async (event) => {
    //     event.preventDefault();
    //     try{
    //         await axios.delete('http://localhost:3001/api/users/deleteMed',)
    //     } catch (err){
    //         console.error(err)
    //     }
    // };
    // console.log('THIS IS PROPS')

    const renderHeader = () => {
        let headerElement = ['title', 'morning', 'afternoon', 'evening', 'night', 'as needed', 'remove']

        return headerElement.map((key, index) => {
            return <th key={index}>{key.toUpperCase()}</th>
        })
    }

    const displayMeds = (props) => {
        const {medlist, onDelete} = props

        if (medlist.length>0){
            return(
                medlist.map((med) => {
                    return (
                                <tr key={med._id}>
                                    <td>{med.title}</td>
                                    <td><input type="checkbox" id={`medication_${med._id}_morning`} checked={!!med.morning} readOnly aria-label={`Checkbox for ${med.title} in the morning`} /></td>
                                    <td><input type="checkbox" id={`medication_${med._id}_afternoon`} checked={!!med.afternoon} readOnly aria-label={`Checkbox for ${med.title} in the afternoon`} /></td>
                                    <td><input type="checkbox" id={`medication_${med._id}_evening`} checked={!!med.evening} readOnly aria-label={`Checkbox for ${med.title} in the evening`} /></td>
                                    <td><input type="checkbox" id={`medication_${med._id}_night`} checked={!!med.night} readOnly aria-label={`Checkbox for ${med.title} in the night`} /></td>
                                    <td><input type="checkbox" id={`medication_${med._id}_as_needed`} checked={!!med.as_needed} readOnly aria-label={`Checkbox for ${med.title} as needed`} /></td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => onDelete(med.title)}
                                            aria-label={`Remove ${med.title}`}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                    )
                })
            )
        }else {
            return (<h2>no meds!</h2>)
        }
    }
    return (
        <table className="table table-striped">
            <thead>
                <tr>{renderHeader()}</tr>
            </thead>
            <tbody>
                {displayMeds(props)}
            </tbody>
        </table>
    )
}