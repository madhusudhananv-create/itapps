import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
} from '@mui/material';

type CollectionSelectorProps = Readonly<{
  collections: string[];
  selectedCollections: string[];
  onSelectionChange: (collections: string[]) => void;
  disabled?: boolean;
}>;

const styles = {
  container: {
    mt: 1,
  },
  description: {
    mb: 2,
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
  },
};

export function CollectionSelector({
  collections,
  selectedCollections,
  onSelectionChange,
  disabled = false,
}: CollectionSelectorProps) {
  const handleChange = (event: { target: { value: string | string[] } }) => {
    const value =
      typeof event.target.value === 'string'
        ? event.target.value.split(',')
        : event.target.value;
    onSelectionChange(value);
  };

  const formatCollectionName = (name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <Box sx={styles.container}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={styles.description}
      >
        Choose which collections you want to restore. All collections are
        selected by default.
      </Typography>

      <FormControl fullWidth>
        <InputLabel>Collections to Restore</InputLabel>
        <Select
          multiple
          value={selectedCollections}
          onChange={handleChange}
          input={<OutlinedInput label="Collections to Restore" />}
          renderValue={(selected) => (
            <Box sx={styles.chipContainer}>
              {selected.map((value) => (
                <Chip
                  key={value}
                  label={formatCollectionName(value)}
                  size="small"
                />
              ))}
            </Box>
          )}
          disabled={disabled}
        >
          {collections.map((collection) => (
            <MenuItem key={collection} value={collection}>
              {formatCollectionName(collection)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
