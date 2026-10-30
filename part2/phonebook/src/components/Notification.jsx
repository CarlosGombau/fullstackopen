// Shows a message: green if it is a success, red if it is an error
const Notification = ({ notification }) => {
  // Nothing to show: render nothing
  if (notification === null) {
    return null
  }

  const style = {
    color: notification.type === 'error' ? 'red' : 'green',
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  }

  return <div style={style}>{notification.text}</div>
}

export default Notification