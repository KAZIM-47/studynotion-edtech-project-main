// Importing React hook for managing component state
import { useEffect, useState } from "react"
// Importing React icon component
import { MdClose } from "react-icons/md"
import { useSelector } from "react-redux"

// Defining a functional component ChipInput
export default function ChipInput({
  // Props to be passed to the component
  label,
  name,
  placeholder,
  register,
  errors,
  setValue,
  getValues,
}) {
  const { editCourse, course } = useSelector((state) => state.course)

  // Setting up state for managing chips array and text input
  const [chips, setChips] = useState([])
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    if (editCourse) {
      setChips(course?.tag || [])
    }
    register(name, {
      required: true,
      validate: (value) =>
        (Array.isArray(value) && value.length > 0) || `${label} is required`,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setValue(name, chips, { shouldValidate: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chips])

  // Function to handle user input when chips are added
  const handleKeyDown = (event) => {
    // Check if user presses "Enter" or ","
    if (event.key === "Enter" || event.key === ",") {
      // Prevent the default behavior of the event (do not submit the form)
      event.preventDefault()
      // Get the input value and trim any leading/trailing whitespace
      const chipValue = tagInput.trim()

      // Prevent empty tag
      if (!chipValue) {
        return
      }

      // Check if tag already exists (case-insensitive duplicate check)
      const isDuplicate = chips.some(
        (chip) => chip.toLowerCase() === chipValue.toLowerCase()
      )
      if (isDuplicate) {
        return
      }

      // Add the chip to the array and clear the input
      const newChips = [...chips, chipValue]
      setChips(newChips)
      setTagInput("")
    }
  }

  // Function to handle deletion of a chip
  const handleDeleteChip = (chipIndex) => {
    // Filter the chips array to remove the chip with the given index
    const newChips = chips.filter((_, index) => index !== chipIndex)
    setChips(newChips)
  }

  // Render the component
  return (
    <div className="flex flex-col space-y-2">
      {/* Render the label for the input */}
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} <sup className="text-pink-200">*</sup>
      </label>
      {/* Render the chips and input */}
      <div className="flex w-full flex-wrap gap-y-2">
        {/* Map over the chips array and render each chip */}
        {chips.map((chip, index) => (
          <div
            key={index}
            className="m-1 flex items-center rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-richblack-900"
          >
            {/* Render the chip value */}
            <span>{chip}</span>
            {/* Render the button to delete the chip */}
            <button
              type="button"
              className="ml-2 focus:outline-none hover:text-pink-200"
              onClick={() => handleDeleteChip(index)}
              aria-label={`Remove ${chip}`}
            >
              <MdClose className="text-sm" />
            </button>
          </div>
        ))}
        {/* Render the input for adding new chips */}
        <input
          id={name}
          type="text"
          placeholder={placeholder}
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="form-style w-full"
        />
      </div>
      {/* Render an error message if the input is required and not filled */}
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  )
}
